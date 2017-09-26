<?php
/* Smarty version 3.1.31, created on 2017-09-22 07:23:21
  from "C:\wwwroot\boui\api\templates\layout.tpl" */

/* @var Smarty_Internal_Template $_smarty_tpl */
if ($_smarty_tpl->_decodeProperties($_smarty_tpl, array (
  'version' => '3.1.31',
  'unifunc' => 'content_59c4ba69d2fbe0_00621786',
  'has_nocache_code' => false,
  'file_dependency' => 
  array (
    '55572cc1d5d13f3d3b896db34e62263beb986238' => 
    array (
      0 => 'C:\\wwwroot\\boui\\api\\templates\\layout.tpl',
      1 => 1506064999,
      2 => 'file',
    ),
  ),
  'includes' => 
  array (
  ),
),false)) {
function content_59c4ba69d2fbe0_00621786 (Smarty_Internal_Template $_smarty_tpl) {
$_smarty_tpl->_loadInheritance();
$_smarty_tpl->inheritance->init($_smarty_tpl, false);
?>
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
	margin: 70px auto;
	padding: 20px;
	background: #fff;
	border-radius: 5px;
	width: 30%;
	position: relative;
	transition: all 5s ease-in-out;
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
@media screen and (max-width: 700px){
  .popup{
    width: 70%;
  }
}
</style>
<body>
<body>
    <?php 
$_smarty_tpl->inheritance->instanceBlock($_smarty_tpl, 'Block_3050059c4ba69d26630_68490027', 'content');
?>

</body>
</html><?php }
/* {block 'content'} */
class Block_3050059c4ba69d26630_68490027 extends Smarty_Internal_Block
{
public $subBlocks = array (
  'content' => 
  array (
    0 => 'Block_3050059c4ba69d26630_68490027',
  ),
);
public function callBlock(Smarty_Internal_Template $_smarty_tpl) {
?>
Piletilevi API<?php
}
}
/* {/block 'content'} */
}
