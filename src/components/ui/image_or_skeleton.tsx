'use client'
import Skeleton from '@/components/ui/skeleton'
import DeleteIcon from '@mui/icons-material/Delete';
type ImageDict ={
    key: String
  }
  
  
export default function Image({index,image,removeImage}:{index:number,image:ImageDict,removeImage:Promise<void>}){
    return (
        <>
        {

       
            <>
            {/**to move an element within another, make inner element absolute and outer relative. So the inner is placed absolute relative to outer. */}
            <div className="max-w-xs relative">
            <DeleteIcon onClick ={()=>removeImage(image['Key'])} className='absolute top-2 right-2 cursor-pointer'/>
            <img key={index} src ={`https://image-generator-lalva224.s3.us-east-1.amazonaws.com/${image['Key']}`}/>
            </div>
            </>
        
        
}
        </>
    )
}