const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 3000;
const DB = path.join(__dirname, "database.json");

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..")));

function readDB(){return JSON.parse(fs.readFileSync(DB,"utf8"));}
function writeDB(data){fs.writeFileSync(DB,JSON.stringify(data,null,2));}

app.get("/api/coffees",(req,res)=>res.json(readDB().coffees));
app.get("/api/reviews",(req,res)=>res.json(readDB().reviews));
app.get("/api/stats",(req,res)=>{
  const db=readDB(), reviews=db.reviews;
  const avg=reviews.length?reviews.reduce((s,r)=>s+Number(r.rating),0)/reviews.length:0;
  res.json({average:Number(avg.toFixed(1)),reviews:reviews.length,coffees:db.coffees.length});
});
app.post("/api/reviews",(req,res)=>{
  const db=readDB();
  const review={id:Date.now(),name:req.body.name||"Anonymous",coffeeName:req.body.coffeeName||"Coffee",type:req.body.type||"Coffee",rating:Number(req.body.rating)||0,taste:Number(req.body.taste)||0,aroma:Number(req.body.aroma)||0,presentation:Number(req.body.presentation)||0,comment:req.body.comment||"",date:"Just now"};
  db.reviews.unshift(review); writeDB(db); res.status(201).json(review);
});
app.delete("/api/reviews/:id",(req,res)=>{
  const db=readDB(); db.reviews=db.reviews.filter(r=>r.id!==Number(req.params.id)); writeDB(db); res.json({success:true});
});
app.listen(PORT,()=>console.log(`Brewlog server running at http://localhost:${PORT}`));
