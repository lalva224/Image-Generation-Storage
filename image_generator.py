import modal
from pathlib import Path
import os
import boto3
#creates a container image where the dependencies are installed
image = modal.Image.debian_slim().pip_install('diffusers','transformers' ,'accelerate','fastapi[standard]','sentencepiece','boto3')
app = modal.App('sd-igclone',image=image)
volume = modal.Volume.from_name("model-weights-vol", create_if_missing=True)
MODEL_DIR = Path("/models")
#active imports inside container image
with image.imports():
  import torch
  from diffusers import StableDiffusion3Pipeline
  import io
  from fastapi import Response



#a class allows us to encapsulate logic. Otherwise we would have to specify image and gpu for every single function
@app.cls(image=image, gpu='A100',volumes={MODEL_DIR: volume},secrets=[modal.Secret.from_name("sdxl-medium"),modal.Secret.from_name("s3 bucket-image generator")])
class Model:
  #this is used when the container is first created, it is used to load the model weights, this way the execution of the endpoint is faster
  @modal.build()
  @modal.enter()
  def load_weights(self):
    self.pipe = StableDiffusion3Pipeline.from_pretrained("stabilityai/stable-diffusion-3-medium-diffusers", torch_dtype=torch.float16)
    self.pipe.to("cuda")
    self.s3_client = boto3.client(
    's3',
    aws_access_key_id=os.environ['aws_access_key_id'],
    aws_secret_access_key=os.environ['aws_secret_access_key']
)

  @modal.method()
  def generate(self,prompt:str):
    image = self.pipe(
      prompt,
      negative_prompt="",
      num_inference_steps=28,
      guidance_scale=7.0,
  ).images[0]
    buffer = io.BytesIO()
    image.save(buffer, format="JPEG")

    file_name = f"{prompt}.jpg"
    bucket_name = "image-generator-lalva224"

    print('Uploading to S3')
    #by default fastapi would return a json response like {detail:'hello'} but we want to return binary image. Essentially its a way to bypass json serialization, good for images and video.
    self.s3_client.put_object(
        Bucket=bucket_name,
        Key=file_name,
        Body=buffer.getvalue(),
        ContentType="image/jpeg"
    )
    
    # Construct the URL (assuming the S3 bucket is public)
    image_url = f"https://{bucket_name}.s3.amazonaws.com/{file_name}"
    print(image_url)
    # Return the URL
    return  image_url
    
  
  @modal.web_endpoint()
  def web(self,prompt:str):
    image =self.generate.local(prompt)
    return image
    # return Response(content=image,media_type="text/plain",status_code=200)
    
    


