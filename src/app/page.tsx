"use client";

import { useEffect, useState } from "react";
import AWS from "aws-sdk";
import DeleteIcon from '@mui/icons-material/Delete';
import Skeleton from '@/components/ui/skeleton'
import { Suspense } from "react";
import ImageGrid from "@/components/imageGrid";
import Image from '@/components/ui/image_or_skeleton'

const client = new AWS.S3({
  accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
  region: 'us-east-1', 
});
type ImageDict ={
  key: String
}


export default function Home() {
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<ImageDict[]>([]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputText }),
      });

      const data = await response.json();
      // const new_url:string = data['message']
      // setInputText("");
      // setImages([...images,new_url])
      // //call getImages
      // await getImages()

      //we dont really need to add new url we could just call getImages bc the new image is in S3 no
      if(data['success']){
        const response = getImages().then((data)=>setImages(data.Contents))
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getImages = async ()=>{
    console.log('refreshing!')
    const params = {
      Bucket: 'image-generator-lalva224'
    }
    const data = await client.listObjectsV2(params).promise()
    return data
  }
  const removeImage = async (url:string)=>{
    const params = {
      Bucket: 'image-generator-lalva224',
      Key: url
    }

    try{
      const response = await client.deleteObject(params).promise();
      console.log(params['Key'])
      //lets remove it from state to make the removal instant.
      setImages((prevImages)=>prevImages.filter((image)=>image['Key']!=url))
      
    }
    catch(error){
      console.log(error)
    }
  }
  useEffect(()=>{
    //on mount but also after every api request
    const response = getImages().then((data)=>setImages(data.Contents))
    
  },[])
  
  return (
   
    <div className="min-h-screen flex flex-col justify-between bg-black">
      <main className="flex-1">
        <div className="justify-center flex flex-row gap-5 flex-wrap">
          
          {images.map((image,index)=>(
           
           <Image removeImage={removeImage} key={index}  image={image} index={index}/>
         
           
          ))} 
       
        </div>
      </main>

      <footer className="mt-5 w-full max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="w-full">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              className="flex-1 p-3 rounded-lg bg-black/[.05] dark:bg-white/[.06] border border-black/[.08] dark:border-white/[.145] focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              placeholder="Describe the image you want to generate..."
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 rounded-lg bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] transition-colors disabled:opacity-50"
            >
              {isLoading ? "Generating..." : "Generate"}
            </button>
          </div>
        </form>
      </footer>
    </div>
  );
}
