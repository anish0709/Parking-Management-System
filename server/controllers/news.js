
const axios = require('axios')


exports.getNews = async(req,res)=>{
    try{
        //latest news are obtained from newsapi.org
        const {data} = await axios.get(`https://newsapi.org/v2/top-headlines?country=us&apiKey=5392006d6b9a450f905c0badc549fe38&category=technology`)
        console.log(data);
        //max 10 articles are fetched
    
        return res.status(200).json({msg:"News fetched",news:data.articles.splice(0,Math.min(data.articles.length,10))})
    }catch(err){
        return res.status(500).json({msg:"Something went wrong..."})
    }
}
