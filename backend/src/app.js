import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { categories, products, labTests, doctors } from "./data.js";
import { getChatReply, getGeminiStatus, createSupportTicket } from "./chatbot.js";
import { readStore, updateStore } from "./storage.js";

dotenv.config();
const app=express();
const __dirname=path.dirname(fileURLToPath(import.meta.url));
const uploadDir = process.env.VERCEL
  ? path.join("/tmp", "arocare-uploads")
  : path.join(__dirname, "../uploads");
fs.mkdirSync(uploadDir, { recursive: true });
const upload=multer({dest:uploadDir,limits:{fileSize:5*1024*1024},fileFilter:(_,file,cb)=>cb(null,/image\/(jpeg|png|webp)|application\/pdf/.test(file.mimetype))});
const configuredOrigins=(process.env.FRONTEND_URL||"http://localhost:5173").split(",").map(x=>x.trim()).filter(Boolean);
app.use(cors({
  origin(origin,callback){
    const localDevelopment=/^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin||"");
    if(!origin||configuredOrigins.includes(origin)||localDevelopment)return callback(null,true);
    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials:true
}));
app.use(express.json({limit:"1mb"}));
app.use("/uploads",express.static(uploadDir));
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    app: "AroCare API",
    message: "AroCare backend is running",
    endpoints: {
      health: "/health",
      products: "/api/products",
      chatbotStatus: "/api/chat/status"
    }
  });
});

app.get("/favicon.ico", (req, res) => {
  res.status(204).end();
});

app.get("/favicon.png", (req, res) => {
  res.status(204).end();
});
app.get("/health",(_,res)=>res.json({status:"ok",app:"AroCare API",chatbot:process.env.GEMINI_API_KEY?"Gemini + local fallback":"local fallback",geminiConfigured:Boolean(process.env.GEMINI_API_KEY),geminiModel:process.env.GEMINI_MODEL||"auto-detect"}));
app.get("/api/chat/status",async(_,res)=>res.json(await getGeminiStatus({apiKey:process.env.GEMINI_API_KEY,model:process.env.GEMINI_MODEL||""})));
app.get("/api/categories",(_,res)=>res.json(categories));
app.get("/api/products",(req,res)=>{ const q=String(req.query.q||"").toLowerCase(); const category=String(req.query.category||"all"); res.json(products.filter(p=>(category==="all"||p.category===category)&&(!q||`${p.name} ${p.generic} ${p.brand} ${p.tagline}`.toLowerCase().includes(q)))); });
app.get("/api/products/:id",(req,res)=>{const p=products.find(x=>x.id===Number(req.params.id));return p?res.json(p):res.status(404).json({message:"Product not found"});});
app.get("/api/lab-tests",(_,res)=>res.json(labTests));
app.post("/api/lab-bookings",(req,res)=>{ const booking=updateStore(s=>{const b={id:`LAB-${Date.now().toString().slice(-6)}`,status:"Collection requested",createdAt:new Date().toISOString(),...req.body};s.labBookings.push(b);return b;});res.status(201).json(booking); });
app.get("/api/doctors",(_,res)=>res.json(doctors));
app.post("/api/doctor-bookings",(req,res)=>{ const booking=updateStore(s=>{const b={id:`DOC-${Date.now().toString().slice(-6)}`,status:"Appointment requested",createdAt:new Date().toISOString(),...req.body};s.doctorBookings.push(b);return b;});res.status(201).json(booking); });
app.get("/api/orders",(_,res)=>res.json(readStore().orders));
app.get("/api/orders/:id",(req,res)=>{const id=req.params.id.toUpperCase();const order=readStore().orders.find(o=>o.id===id);return order?res.json(order):res.status(404).json({message:"Order not found"});});
app.post("/api/orders",(req,res)=>{const order=updateStore(s=>{const id=`AC-${Math.floor(1000+Math.random()*8999)}`;const o={id,status:"Order confirmed",eta:"Within 1–3 working days",timeline:["Order confirmed"],createdAt:new Date().toISOString(),...req.body};s.orders.push(o);return o;});res.status(201).json(order);});
app.get("/api/prescriptions",(_,res)=>res.json(readStore().prescriptions));
app.post("/api/prescriptions",upload.single("prescription"),(req,res)=>{if(!req.file)return res.status(400).json({message:"Please attach a JPG, PNG, WEBP or PDF under 5 MB"});const item=updateStore(s=>{const p={id:`RX-${Date.now().toString().slice(-6)}`,status:"Submitted for pharmacist review",createdAt:new Date().toISOString(),originalName:req.file.originalname,fileName:req.file.filename,patientName:req.body.patientName||"",phone:req.body.phone||""};s.prescriptions.push(p);return p;});res.status(201).json(item);});
app.post("/api/chat",async(req,res)=>{const message=String(req.body.message||"").trim();if(!message)return res.status(400).json({message:"Message is required"});res.json(await getChatReply({message,history:req.body.history||[]},{apiKey:process.env.GEMINI_API_KEY,model:process.env.GEMINI_MODEL||""}));});
app.post("/api/support-tickets",(req,res)=>{if(!req.body.name||!req.body.phone||!req.body.issue)return res.status(400).json({message:"Name, phone and issue are required"});res.status(201).json(createSupportTicket(req.body));});
app.get("/api/admin/metrics",(_,res)=>{const s=readStore();res.json({revenue:s.orders.reduce((a,o)=>a+Number(o.total||0),0)+483250,orders:s.orders.length+1280,customers:8940,prescriptions:s.prescriptions.length+176,pendingSupport:s.supportTickets.filter(x=>x.status==="Open").length,labBookings:s.labBookings.length,doctorBookings:s.doctorBookings.length,lowStock:products.filter(p=>p.stock<20).length,recentOrders:[...s.orders].reverse().slice(0,5),supportTickets:[...s.supportTickets].reverse().slice(0,5)});});
app.get("/api/admin/orders",(_,res)=>res.json([...readStore().orders].reverse()));
app.get("/api/admin/products",(_,res)=>res.json(products));
app.get("/api/admin/prescriptions",(_,res)=>res.json([...readStore().prescriptions].reverse()));
app.get("/api/admin/lab-bookings",(_,res)=>res.json([...readStore().labBookings].reverse()));
app.get("/api/admin/doctor-bookings",(_,res)=>res.json([...readStore().doctorBookings].reverse()));
app.get("/api/admin/support-tickets",(_,res)=>res.json([...readStore().supportTickets].reverse()));
app.patch("/api/admin/orders/:id",(req,res)=>{const allowed=["Order confirmed","Pharmacist reviewed","Packed","Out for delivery","Delivered","Cancelled"];const status=String(req.body.status||"");if(!allowed.includes(status))return res.status(400).json({message:"Invalid order status"});const updated=updateStore(store=>{const order=store.orders.find(item=>item.id===req.params.id.toUpperCase());if(!order)return null;order.status=status;if(!order.timeline)order.timeline=[];if(!order.timeline.includes(status)&&status!=="Cancelled")order.timeline.push(status);return order;});return updated?res.json(updated):res.status(404).json({message:"Order not found"});});
app.use((err,req,res,next)=>{console.error(err);if(err?.code==="LIMIT_FILE_SIZE")return res.status(413).json({message:"File must be under 5 MB"});res.status(500).json({message:"Something went wrong"});});
export default app;
