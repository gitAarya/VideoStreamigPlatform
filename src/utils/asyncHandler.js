const asyncHandler= (fn)=>{
return (req,res,next)=>{
    Promise.resolve( fn(req,res,next)).catch( (err)=> next(err))
}

}

export {asyncHandler}

// const asyncHandler= ()=>{}
// const asyncHandler=(func)=>{()=>{}}
// const asyncHandler=(func)=> async()=>{}
   
    // const asyncHandler=(fun)=> async (req,res,next)=>{
    //     try {
    //         await (req,res,next)
            
    //     } catch (error) {
    //         res.status(error.code||500).json(
    //             {
    //                 success:false,
    //                 message:error.message
    //             }
    //         )
            
    //     }

    // }