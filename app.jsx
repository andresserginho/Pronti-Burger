const { useState, useEffect } = React;

const App = () => {

const [modulo, setModulo] = useState("clientes");

/* ================= INVENTARIO ================= */
const [insumos, setInsumos] = useState(() => {
    const data = localStorage.getItem("DB");
    return data ? JSON.parse(data) : [
        {nombre:'PAN', stock:100, precio:1500},
        {nombre:'CARNE', stock:80, precio:6000},
        {nombre:'POLLO', stock:60, precio:5000},
        {nombre:'SALCHICHA', stock:80, precio:2500},
        {nombre:'CHORIZO', stock:40, precio:3000},
        {nombre:'QUESO', stock:100, precio:2000},
        {nombre:'TOCINETA', stock:50, precio:3000},
        {nombre:'PAPAS', stock:150, precio:4000},
        {nombre:'TOMATE', stock:80, precio:500},
        {nombre:'CEBOLLA', stock:80, precio:500},
        {nombre:'SALSAS', stock:200, precio:300},
        {nombre:'MAIZ', stock:50, precio:800}
    ];
});

/* ================= VENTAS ================= */
const [ventas, setVentas] = useState(() => {
    const v = localStorage.getItem("VENTAS");
    return v ? JSON.parse(v) : [];
});

/* ================= CONSUMO ================= */
const [consumo, setConsumo] = useState(() => {
    const c = localStorage.getItem("CONSUMO");
    return c ? JSON.parse(c) : [];
});

/* ================= FACTURA ================= */
const [factura, setFactura] = useState(null);

/* ================= FECHA ================= */
const [fechaFiltro, setFechaFiltro] = useState(new Date().toLocaleDateString());

/* ================= CARRITO ================= */
const [carrito, setCarrito] = useState([]);

/* ================= COMPRA INVENTARIO ================= */
const [cantCompra, setCantCompra] = useState({});

useEffect(()=> localStorage.setItem("DB", JSON.stringify(insumos)), [insumos]);
useEffect(()=> localStorage.setItem("VENTAS", JSON.stringify(ventas)), [ventas]);
useEffect(()=> localStorage.setItem("CONSUMO", JSON.stringify(consumo)), [consumo]);

/* ================= MENU ================= */
const menu = [
{nombre:"Sencilla",precio:17800,ing:["PAN","CARNE","QUESO","TOMATE","CEBOLLA","SALSAS"]},
{nombre:"Pollo",precio:17800,ing:["PAN","POLLO","QUESO","TOMATE","CEBOLLA","SALSAS"]},
{nombre:"Berraquita",precio:22000,ing:["PAN","CARNE","QUESO","TOCINETA","SALSAS"]},
{nombre:"Doble Carne",precio:31500,ing:["PAN","CARNE","CARNE","QUESO"]},
{nombre:"Perro Sencillo",precio:16000,ing:["PAN","SALCHICHA","PAPAS","QUESO","SALSAS"]},
{nombre:"Choriperro",precio:18000,ing:["PAN","CHORIZO","PAPAS"]},
{nombre:"Americano",precio:17500,ing:["PAN","SALCHICHA","QUESO"]},
{nombre:"Perro Loco",precio:27900,ing:["PAN","SALCHICHA","CARNE","QUESO","TOCINETA"]}
];

/* ================= CARRITO ================= */
const agregar = (prod) => {
    setCarrito([...carrito, prod]);
};

/* ================= VALIDAR STOCK ================= */
const validarStock = () => {
    let conteo = {};

    carrito.forEach(p=>{
        p.ing.forEach(i=>{
            conteo[i] = (conteo[i]||0)+1;
        });
    });

    for(let key in conteo){
        const item = insumos.find(i=>i.nombre===key);
        if(!item || item.stock < conteo[key]){
            alert("❌ No hay suficiente " + key);
            return false;
        }
    }
    return true;
};

/* ================= HACER PEDIDO ================= */
const hacerPedido = () => {

if(carrito.length === 0) return alert("Agrega productos");
if(!validarStock()) return;

let copia = [...insumos];
let consumoDia = [];
let totalPedido = 0;
let costoPedido = 0;

carrito.forEach(p => {

    totalPedido += p.precio;

    p.ing.forEach(i=>{
        const item = copia.find(x=>x.nombre===i);
        if(item){
            item.stock--;
            costoPedido += item.precio;
        }

        consumoDia.push({nombre:i, fecha:new Date().toLocaleDateString()});
    });

    setVentas(prev=>[
        ...prev,
        {nombre:p.nombre, precio:p.precio, fecha:new Date().toLocaleDateString()}
    ]);
});

setConsumo(prev => [...prev, ...consumoDia]);
setInsumos(copia);

setFactura({
    items: carrito,
    total: totalPedido,
    costo: costoPedido
});

setCarrito([]);
};

/* ================= COMPRAR INVENTARIO ================= */
const comprar = (nombre, cantidad) => {

if(!cantidad || cantidad <= 0){
    return alert("Ingresa cantidad válida");
}

let copia = [...insumos];
const prod = copia.find(i => i.nombre === nombre);

if(prod){
    prod.stock += cantidad;
}

setInsumos(copia);

setFactura({
    compra:true,
    nombre,
    cantidad,
    total: cantidad * prod.precio
});
};

/* ================= ESTADÍSTICAS ================= */
const ventasFiltro = ventas.filter(v=>v.fecha===fechaFiltro);
const totalVentas = ventasFiltro.reduce((a,b)=>a+b.precio,0);

const consumoFiltro = consumo.filter(c=>c.fecha===fechaFiltro);

let resumen = {};
let costo = 0;

consumoFiltro.forEach(c=>{
    resumen[c.nombre] = (resumen[c.nombre]||0)+1;

    const item = insumos.find(i=>i.nombre===c.nombre);
    if(item) costo += item.precio;
});

const ganancia = totalVentas - costo;

/* ================= UI ================= */
return (
<div className="app-container">

{/* SIDEBAR */}
<div className="sidebar">
<div className="logo">PRONTI</div>

<button onClick={()=>setModulo("clientes")}>🍔 MENÚ</button>
<button onClick={()=>setModulo("stock")}>📦 INVENTARIO</button>
<button onClick={()=>setModulo("stats")}>📊 ESTADÍSTICAS</button>
</div>

{/* MAIN */}
<div className="main-content">

{/* MENÚ */}
{modulo==="clientes" && (
<div>

<h1>MENÚ</h1>

<div className="menu-grid">
{menu.map((p,i)=>(
<div key={i} className="menu-card-pro">

<div className="card-header">{p.nombre}</div>
<div className="card-price">${p.precio.toLocaleString()}</div>

<button className="btn-outline" onClick={()=>agregar(p)}>
AGREGAR
</button>

</div>
))}
</div>

<h3>🛒 {carrito.length} productos</h3>

<button className="btn-pronti" onClick={hacerPedido}>
CONFIRMAR PEDIDO
</button>

</div>
)}

{/* INVENTARIO */}
{modulo==="stock" && (
<div>

<h1>INVENTARIO</h1>

<div className="industrial-grid">
{insumos.map((i,idx)=>(
<div key={idx} className="ind-card">

<div className="ind-name">{i.nombre}</div>

<div className="ind-val">
{i.stock}
</div>

<input
type="number"
min="1"
placeholder="Cantidad"
value={cantCompra[i.nombre] || ""}

onChange={(e)=>setCantCompra({
    ...cantCompra,
    [i.nombre]: Number(e.target.value)
})}

style={{
width:"100%",
marginTop:"10px",
padding:"10px",
background:"#111",
color:"white",
border:"1px solid #ff4500",
borderRadius:"8px",
textAlign:"center",
fontWeight:"bold"
}}
/>

<button
className="btn-pronti"
style={{width:"100%", marginTop:"10px"}}
onClick={()=>{
    comprar(i.nombre, cantCompra[i.nombre] || 0);

    setCantCompra(prev => ({
        ...prev,
        [i.nombre] : ""
    }));
}}
>
COMPRAR
</button>

</div>
))}
</div>

</div>
)}

{/* ESTADÍSTICAS */}
{modulo==="stats" && (
<div style={{
background:"#111",
padding:"20px",
borderRadius:"12px",
border:"1px solid #ff4500"
}}>

<h2 style={{color:"#ff4500"}}>📊 ESTADÍSTICAS DEL DÍA</h2>

<input
type="date"
onChange={(e)=>setFechaFiltro(e.target.value)}
style={{
padding:"10px",
background:"#000",
color:"white",
border:"1px solid #ff4500",
borderRadius:"8px",
marginBottom:"15px"
}}
/>

<div style={{
display:"grid",
gridTemplateColumns:"repeat(auto-fit, minmax(180px,1fr))",
gap:"15px"
}}>

<div style={{background:"#000",padding:"15px",borderRadius:"10px"}}>
<h3 style={{color:"#ff4500"}}>VENTAS</h3>
<h2>${totalVentas.toLocaleString()}</h2>
</div>

<div style={{background:"#000",padding:"15px",borderRadius:"10px"}}>
<h3 style={{color:"#ff4500"}}>COSTO</h3>
<h2>${costo.toLocaleString()}</h2>
</div>

<div style={{background:"#000",padding:"15px",borderRadius:"10px"}}>
<h3 style={{color:"#ff4500"}}>GANANCIA</h3>
<h2>${ganancia.toLocaleString()}</h2>
</div>

</div>

</div>
)}

</div>

{/* FACTURA */}
{factura && (
<div style={{
position:"fixed",
top:0,left:0,right:0,bottom:0,
background:"rgba(0,0,0,0.7)",
display:"flex",
justifyContent:"center",
alignItems:"center"
}}>

<div style={{
background:"white",
color:"black",
padding:"25px",
width:"320px",
borderRadius:"10px",
fontFamily:"monospace",
position:"relative"
}}>

<button
onClick={()=>setFactura(null)}
style={{
position:"absolute",
top:"10px",
right:"10px",
background:"red",
color:"white",
border:"none",
borderRadius:"50%",
width:"30px",
height:"30px"
}}
>
X
</button>

<h3>FACTURA PRONTI</h3>
<hr/>

{factura.items && (() => {
    const res = {};

    factura.items.forEach(prod => {
        prod.ing.forEach(i => {
            res[i] = (res[i] || 0) + 1;
        });
    });

    return Object.entries(res).map(([nombre,cant],i)=>(
        <p key={i}>{cant} x {nombre}</p>
    ));
})()}

<hr/>

<h2>Total: ${factura.total}</h2>

</div>

</div>
)}

</div>
);
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);