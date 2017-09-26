<?php
/* Smarty version 3.1.31, created on 2017-09-22 07:26:20
  from "C:\wwwroot\boui\api\templates\404.tpl" */

/* @var Smarty_Internal_Template $_smarty_tpl */
if ($_smarty_tpl->_decodeProperties($_smarty_tpl, array (
  'version' => '3.1.31',
  'unifunc' => 'content_59c4bb1c0a1fe2_51793006',
  'has_nocache_code' => false,
  'file_dependency' => 
  array (
    '3112fdf2486f6d6ede534d5430067c5b6596f0f7' => 
    array (
      0 => 'C:\\wwwroot\\boui\\api\\templates\\404.tpl',
      1 => 1506065164,
      2 => 'file',
    ),
  ),
  'includes' => 
  array (
  ),
),false)) {
function content_59c4bb1c0a1fe2_51793006 (Smarty_Internal_Template $_smarty_tpl) {
$_smarty_tpl->_loadInheritance();
$_smarty_tpl->inheritance->init($_smarty_tpl, true);
?>

<?php 
$_smarty_tpl->inheritance->instanceBlock($_smarty_tpl, 'Block_287059c4bb1c09bdd0_02277268', 'content');
$_smarty_tpl->inheritance->endChild($_smarty_tpl, "layout.tpl");
}
/* {block 'content'} */
class Block_287059c4bb1c09bdd0_02277268 extends Smarty_Internal_Block
{
public $subBlocks = array (
  'content' => 
  array (
    0 => 'Block_287059c4bb1c09bdd0_02277268',
  ),
);
public function callBlock(Smarty_Internal_Template $_smarty_tpl) {
?>

    <div class="middle-box text-center">
        <h1>404</h1>
        <h3 class="font-bold">Page Not Found</h3>

        <div class="error-desc">
            Sorry, but the page you are looking for has not been found. Try checking the URL for error, then hit the refresh button on your browser or try found something else in our app.
        </div>
    </div>
<?php
}
}
/* {/block 'content'} */
}
