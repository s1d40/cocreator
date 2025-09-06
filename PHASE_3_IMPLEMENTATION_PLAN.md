# Phase 3 Implementation Plan: Asynchronous Processing

This document details the plan for implementing asynchronous processing for long-running tasks, such as video generation, using Google Cloud Tasks and Cloud Functions.

---

### 1. Overview

**Problem:** Synchronously generating multiple videos within a single agent tool call can lead to long response times and potential timeouts. This can negatively impact the user experience and the reliability of the application.

**Solution:** We will delegate the video creation task to a dedicated, asynchronous worker. This will be achieved by using Google Cloud Tasks to enqueue video processing jobs, which will then be picked up and executed by a new Cloud Function.

**Workflow:**
1.  The `multimedia_producer_agent` will no longer call the `create_video_from_assets` tool directly.
2.  Instead, it will call a new tool, `enqueue_video_creation_task`.
3.  This new tool will create a task in a Google Cloud Tasks queue. The task payload will contain the necessary information (e.g., image and audio file paths).
4.  A new Cloud Function will be triggered by messages on this queue.
5.  The Cloud Function will execute the video creation logic (extracted from the original `create_video_from_assets` tool) and save the final video to Google Cloud Storage.

---

### 2. Infrastructure Changes (Terraform)

The following resources need to be added to the Terraform configuration in the `my-content-pipeline/deployment/terraform/` directory.

**a. Cloud Tasks Queue (`gcp_tasks.tf`)**

A new file should be created to define the queue.

```hcl
# my-content-pipeline/deployment/terraform/gcp_tasks.tf

resource "google_cloud_tasks_queue" "video_processing_queue" {
  for_each = local.deploy_project_ids
  name     = "${var.project_name}-video-queue"
  location = var.region
  project  = each.value
}
```

**b. Cloud Function (`gcp_functions.tf`)**

A new file should be created to define the Cloud Function.

```hcl
# my-content-pipeline/deployment/terraform/gcp_functions.tf

resource "google_cloudfunctions2_function" "video_processor_function" {
  for_each = local.deploy_project_ids
  name     = "${var.project_name}-video-processor"
  location = var.region
  project  = each.value

  build_config {
    runtime     = "python312"
    entry_point = "process_video_task"
    source {
      storage_source {
        bucket = "${each.value}-${var.project_name}-file-uploads" # Or a dedicated bucket for function source
        object = "functions/video_processor.zip"
      }
    }
  }

  service_config {
    max_instance_count = 3
    min_instance_count = 0
    available_memory   = "512Mi"
    timeout_seconds    = 540
    service_account_email = google_service_account.app_sa[each.key].email
  }

  event_trigger {
    trigger_region = var.region
    event_type     = "google.cloud.tasks.task.v2.attempt.dispatched"
    pubsub_topic   = "projects/${each.value}/topics/cloud-tasks"
    retry_policy   = "RETRY_POLICY_RETRY"
  }
}
```

**c. IAM Permissions (`iam.tf`)**

The application's service account needs permission to create Cloud Tasks.

```hcl
# In my-content-pipeline/deployment/terraform/iam.tf, add to the app_sa_roles variable
"roles/cloudtasks.enqueuer"
```

---

### 3. Cloud Function Implementation

A new Python file for the Cloud Function needs to be created.

**Location:** `my-content-pipeline/functions/video_processor/main.py`

**Code:**
```python
import functions_framework
from google.cloud import storage
# Note: The video creation logic from the original tool needs to be moved here.
# This will likely involve libraries like moviepy.

@functions_framework.cloud_event
def process_video_task(cloud_event):
    """Triggered by a message on a Cloud Tasks queue."""
    # Decode the task payload
    payload = cloud_event.data["message"]["data"]
    # ... (logic to parse image_paths, audio_paths from payload)

    # --- Video Creation Logic ---
    # This logic should be extracted from the `create_video_from_assets` tool
    # in `my-content-pipeline/app/tools/multimedia.py`.
    # It will involve:
    # 1. Downloading the image and audio files from GCS.
    # 2. Using a library like MoviePy to create the video.
    # 3. Uploading the final video back to GCS.
    # ---------------------------

    print(f"Successfully processed video task.")
```

---

### 4. Agent and Tool Modification

**a. New Tool: `enqueue_video_creation_task`**

A new tool must be created to replace the direct call to `create_video_from_assets`.

**Location:** `my-content-pipeline/app/tools/tasks.py`

```python
from google.cloud import tasks_v2
import json

def enqueue_video_creation_task(image_paths: list[str], audio_paths: list[str], tool_context: ToolContext) -> dict:
    """Enqueues a task to create a video from assets."""
    client = tasks_v2.CloudTasksClient()

    # Construct the task body
    task_payload = {
        "image_paths": image_paths,
        "audio_paths": audio_paths,
    }

    # Construct the task
    # ... (logic to build the full task object, including queue path and payload)

    # Use the client to create a task
    response = client.create_task(request={"parent": parent, "task": task})
    return {"status": "success", "task_name": response.name}
```

**b. Update `multimedia_producer_agent`**

The `multimedia_producer_agent` in `my-content-pipeline/app/agents/agents.py` must be updated:
1.  Remove `create_video_from_assets` from its `tools` list.
2.  Add the new `enqueue_video_creation_task` tool.
3.  Update its `instruction` to call the new tool instead of the old one.

---

### 5. Deployment Steps

1.  **Create and zip the Cloud Function code:**
    ```bash
    mkdir -p my-content-pipeline/functions/video_processor
    # ... create main.py and requirements.txt inside ...
    cd my-content-pipeline/functions/video_processor
    zip -r ../video_processor.zip .
    cd ../../..
    ```
2.  **Upload the zip file to GCS:** The Terraform `google_cloudfunctions2_function` resource expects the source code to be in a GCS bucket.
3.  **Apply Terraform changes:** Run `terraform init` and `terraform apply` to create the new queue and function.
4.  **Update and deploy the main application:** Deploy the updated agent code that uses the new task-enqueueing tool.
