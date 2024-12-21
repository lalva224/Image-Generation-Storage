import modal
from pathlib import Path
# create a Volume, or retrieve it if it exists
volume = modal.Volume.from_name("model-weights-vol", create_if_missing=True)
MODEL_DIR = Path("/models")

# define dependencies for downloading model

download_image = (
    modal.Image.debian_slim()
    .pip_install("huggingface_hub[hf_transfer]",'diffusers','torch','transformers' ,'accelerate','bitsandbytes')  # install fast Rust download client
    .env({"HF_HUB_ENABLE_HF_TRANSFER": "1"})  # and enable it
)
app = modal.App('sd-igclone',image=download_image)

with download_image.imports():
    import torch
    from diffusers import AutoPipelineForText2Image
@app.cls(volumes={MODEL_DIR: volume},image = download_image,gpu='A100') 
class Model:
    @modal.build()
    def download_model_func(
        repo_id: str="stabilityai/sdxl-turbo",
        revision: str=None,  # include a revision to prevent surprises!
        ):
        pipeline = AutoPipelineForText2Image.from_pretrained("stabilityai/sdxl-turbo", torch_dtype=torch.float16, variant="fp16")
        pipeline.save_pretrained(MODEL_DIR)

    