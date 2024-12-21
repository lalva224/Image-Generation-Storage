type ImageDict ={
    key: String
}

export default async function ImageGrid({images}:{images:ImageDict[]}){
    return(
        <>
        {images.map((image,index)=>(
            <img width={'20%'} height={'20%'}key={index} src ={`https://image-generator-lalva224.s3.us-east-1.amazonaws.com/${image['Key']}`}/>
            
          ))} 
          </>
    )
}