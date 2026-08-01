export const categories = [
  { id: "medicine", name: "Medicines", icon: "💊", description: "Prescription and OTC medicines", accent: "mint" },
  { id: "healthcare", name: "Healthcare", icon: "🧴", description: "Daily care and hygiene", accent: "blue" },
  { id: "beauty", name: "Beauty", icon: "✨", description: "Skin, hair and personal care", accent: "rose" },
  { id: "wellness", name: "Wellness", icon: "🌿", description: "Vitamins and nutrition", accent: "lime" },
  { id: "devices", name: "Devices", icon: "🩺", description: "Monitoring and home care", accent: "sky" },
  { id: "mother-baby", name: "Mother & Baby", icon: "🍼", description: "Gentle family care", accent: "peach" }
];

const baseProducts = [
  [1,"Napa 500 mg","Paracetamol","medicine","Beximco",20,24,"10 tablets",false,128,4.8,"p1.png","Fever & pain relief","Temporary relief of fever and mild pain.","Tablet"],
  [2,"Seclo 20 mg","Omeprazole","medicine","Square",55,60,"10 capsules",true,64,4.7,"p2.png","Acidity care","Prescription acid-reducing medicine.","Capsule"],
  [3,"ORS Orange","Oral Rehydration Salts","medicine","SMC",6,7,"1 sachet",false,270,4.9,"p3.png","Hydration","Helps replace fluid and electrolytes during dehydration.","Sachet"],
  [4,"Vitamin C 500","Ascorbic Acid","wellness","AroCare",180,220,"30 tablets",false,80,4.6,"p4.png","Daily nutrition","Vitamin C supplement for daily nutritional support.","Tablet"],
  [5,"Gentle Face Wash","Mild Cleanser","beauty","DermaSoft",390,450,"100 ml",false,37,4.5,"p5.png","Sensitive skincare","Mild daily cleanser for normal to sensitive skin.","Liquid"],
  [6,"SPF 50 Sunscreen","Broad Spectrum Sunscreen","beauty","SunGuard",720,850,"50 ml",false,44,4.8,"p6.png","Sun protection","Broad-spectrum daily sunscreen with a lightweight finish.","Cream"],
  [7,"Digital Thermometer","Digital Thermometer","devices","MediCheck",320,380,"1 device",false,25,4.7,"p7.png","Home monitoring","Fast digital temperature reading for home use.","Device"],
  [8,"Blood Pressure Monitor","Digital BP Machine","devices","PulsePro",2750,3200,"1 device",false,12,4.9,"p8.png","Home monitoring","Automatic upper-arm monitor with memory.","Device"],
  [9,"Baby Lotion","Moisturizing Lotion","mother-baby","LittleCare",430,490,"200 ml",false,33,4.6,"p9.png","Baby skincare","Gentle moisturizing lotion for babies and children.","Lotion"],
  [10,"Diapers Medium","Baby Diapers","mother-baby","HappyBaby",940,1050,"42 pieces",false,19,4.7,"p10.png","Baby essentials","Soft, absorbent diapers with a flexible fit.","Pack"],
  [11,"Calcium + D3","Calcium Carbonate + Vitamin D3","wellness","NutriLife",340,390,"30 tablets",false,72,4.5,"p11.png","Bone nutrition","Calcium and vitamin D nutritional supplement.","Tablet"],
  [12,"Glucometer Starter Kit","Blood Glucose Meter","devices","GlucoEase",1650,1900,"Meter + 10 strips",false,16,4.8,"p12.png","Home monitoring","Blood-glucose monitoring starter kit.","Device"],
  [13,"Antiseptic Hand Wash","Chlorhexidine Wash","healthcare","CleanCare",215,260,"200 ml",false,92,4.6,"p13.png","Personal hygiene","Gentle hand cleansing for everyday hygiene.","Liquid"],
  [14,"Omega-3 Fish Oil","Omega-3 Fatty Acids","wellness","AroCare",765,900,"60 softgels",false,41,4.7,"p14.png","Heart nutrition","Fish-oil supplement containing EPA and DHA.","Softgel"],
  [15,"Kids Multivitamin","Multivitamin & Minerals","mother-baby","NutriKids",510,590,"30 gummies",false,28,4.6,"p15.png","Kids nutrition","Daily multivitamin supplement for children.","Gummy"],
  [16,"Nebulizer Compact","Compressor Nebulizer","devices","AirFlow",2950,3400,"1 device",false,9,4.8,"p16.png","Respiratory device","Compact home nebulizer with adult and child masks.","Device"],
  [17,"Moisturizing Cream","Ceramide Moisturizer","healthcare","SkinCalm",640,720,"100 g",false,35,4.7,"p17.png","Dry skin care","Fragrance-free moisturizer for dry skin.","Cream"],
  [18,"Azithro 500 mg","Azithromycin","medicine","Renata",360,390,"3 tablets",true,22,4.6,"p18.png","Antibiotic","Prescription antibiotic. Use only as directed by a registered clinician.","Tablet"]
];

export const products = baseProducts.map(([id,name,generic,category,brand,price,oldPrice,unit,rx,stock,rating,image,tagline,description,form]) => ({
  id,name,generic,category,brand,price,oldPrice,unit,rx,stock,rating,form,tagline,description,
  image:`/products/${image}`,
  reviews: 520 + id * 137,
  sold: 800 + id * 313,
  highlights: category === "devices" ? ["Easy home use","Warranty support","Quality checked"] : ["Authentic source","Secure packaging","Pharmacist support"],
  directions: rx ? "Use only according to a valid prescription and the prescriber's directions." : "Read the label and follow the recommended directions. Ask a pharmacist when unsure.",
  warning: rx ? "Prescription required. Do not self-medicate or share this medicine." : "Keep away from children. Stop use and seek professional advice if an unexpected reaction occurs."
}));

export const labTests = [
  { id:"cbc",name:"Complete Blood Count (CBC)",price:550,oldPrice:700,sample:"Blood",report:"Same day",fasting:false,category:"Popular" },
  { id:"thyroid",name:"Thyroid Profile (T3, T4, TSH)",price:1200,oldPrice:1450,sample:"Blood",report:"24 hours",fasting:false,category:"Thyroid" },
  { id:"diabetes",name:"Diabetes Checkup Package",price:1450,oldPrice:1850,sample:"Blood & urine",report:"24 hours",fasting:true,category:"Diabetes" },
  { id:"liver",name:"Liver Function Test",price:1350,oldPrice:1650,sample:"Blood",report:"24 hours",fasting:false,category:"Liver" },
  { id:"kidney",name:"Kidney Function Test",price:1300,oldPrice:1550,sample:"Blood & urine",report:"24 hours",fasting:false,category:"Kidney" },
  { id:"full-body",name:"Essential Full Body Checkup",price:2850,oldPrice:3900,sample:"Blood & urine",report:"48 hours",fasting:true,category:"Package" }
];

export const doctors = [
  { id:1,name:"Dr. Nusrat Jahan",specialty:"Medicine Specialist",degree:"MBBS, FCPS (Medicine)",experience:"11 years",fee:700,availability:"Today, 7:30 PM",languages:["Bangla","English"] },
  { id:2,name:"Dr. Mahmud Hasan",specialty:"Dermatologist",degree:"MBBS, DDV",experience:"9 years",fee:850,availability:"Tomorrow, 6:00 PM",languages:["Bangla","English"] },
  { id:3,name:"Dr. Farhana Rahman",specialty:"Child Specialist",degree:"MBBS, MD (Paediatrics)",experience:"13 years",fee:900,availability:"Today, 9:00 PM",languages:["Bangla","English"] },
  { id:4,name:"Dr. Rezaul Karim",specialty:"Cardiologist",degree:"MBBS, MD (Cardiology)",experience:"15 years",fee:1100,availability:"Tomorrow, 8:30 PM",languages:["Bangla","English"] }
];

export const policies = {
  delivery: "Standard delivery is ৳60 in Dhaka and calculated by location outside Dhaka. Orders above ৳999 receive free standard delivery in this demo.",
  prescription: "Prescription-only products are confirmed after pharmacist review. Upload a readable image or PDF with patient and prescriber details.",
  return: "Sealed, eligible non-medicine products may be requested for return within 3 days. Medicines, temperature-sensitive products and opened items are normally non-returnable unless damaged or incorrect.",
  payment: "Demo payment options are cash on delivery, bKash and card. Real launch requires a verified payment gateway.",
  privacy: "Prescription and health records must be stored securely and accessed only for service delivery with user consent."
};
