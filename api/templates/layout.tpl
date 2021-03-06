<!DOCTYPE html>
<html>
<title>Piletilevi API</title>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
html, body, div, span, iframe, 
h1, h2, h3, h4, h5, h6, p, ul, 
li, fieldset, form, label, legend, 
table, caption, tbody, tfoot, thead, 
tr, th, td, pre {
	margin: 0;
	padding: 0;
	border: 0;
	font-size: 16px;
	vertical-align: baseline;
}
h1 {
  font-weight: 100;
  font-size: 80px;
}
body {
	line-height: 1;
}
ol, ul {
	list-style: none;
}
table {
	border-collapse: collapse;
	border-spacing: 0;
}
.overlay {
	position: fixed;
	top: 0;
	bottom: 0;
	left: 0;
	right: 0;
	background: rgba(0, 0, 0, 0.4);
	transition: opacity 500ms;
	visibility: visible;
	opacity: 1;
}	
.overlay:target {
  visibility: visible;
  opacity: 1;
}
.popup {
	margin: auto;
	padding: 20px;
	background: #fff;
	border-radius: 0 0 6px 6px;
	width: 30%;
	position: relative;
}
.popup .content {
  font-size: 28px;
}
.middle-box {
	max-width: 400px;
	z-index: 100;
	margin: 0 auto;
	padding-top: 40px;
} 
.text-center {
	text-align: center;
}
.font-bold {
	font-weight: 600;
	font-size: 30px;
}
.logo {
    margin: 70px auto 0;
    padding: 20px;
    background: #5e7287;
    border-radius: 6px 6px 0 0;
    width: 30%;
    position: relative;
}
.loading-gif {
    max-width: 50px;
}
@media screen and (max-width: 700px){
  .popup, .logo {
    width: 70%;
  }
}
</style>
<body>
<body>
    {block name=content}Piletilevi API{/block}
</body>
</html>