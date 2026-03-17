*{
margin:0;
padding:0;
box-sizing:border-box;
font-family: 'Segoe UI', sans-serif;
}

body{
height:100vh;
display:flex;
justify-content:center;
align-items:center;
background: radial-gradient(circle at top, #1a1a2e, #000);
color:white;
}

/* container */

.container{
width:100%;
display:flex;
justify-content:center;
align-items:center;
}

/* login card */

.login-box{
background:rgba(0,0,0,0.6);
padding:50px;
border-radius:15px;
width:350px;
backdrop-filter:blur(15px);
box-shadow:0 0 30px rgba(0,255,255,0.2);
text-align:center;
}

/* logo */

.logo{
margin-bottom:30px;
font-size:26px;
letter-spacing:2px;
color:#7fffd4;
}

/* inputs */

.input-group{
position:relative;
margin-bottom:30px;
}

.input-group input{
width:100%;
padding:10px;
background:transparent;
border:none;
border-bottom:2px solid #555;
outline:none;
color:white;
font-size:16px;
}

.input-group label{
position:absolute;
left:0;
top:10px;
color:#aaa;
pointer-events:none;
transition:0.3s;
}

/* animation */

.input-group input:focus + label,
.input-group input:valid + label{
top:-15px;
font-size:12px;
color:#00ffff;
}

/* button */

button{
width:100%;
padding:12px;
border:none;
border-radius:8px;
background:linear-gradient(45deg,#00ffff,#7fffd4);
color:#000;
font-weight:bold;
cursor:pointer;
transition:0.3s;
}

button:hover{
transform:scale(1.05);
box-shadow:0 0 20px #00ffff;
}

/* footer */

.footer{
margin-top:20px;
font-size:12px;
color:#888;
}