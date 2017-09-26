<?php
/* Smarty version 3.1.31, created on 2017-09-22 06:45:58
  from "C:\wwwroot\boui\api\templates\payment.tpl" */

/* @var Smarty_Internal_Template $_smarty_tpl */
if ($_smarty_tpl->_decodeProperties($_smarty_tpl, array (
  'version' => '3.1.31',
  'unifunc' => 'content_59c4b1a694ccb2_15876314',
  'has_nocache_code' => false,
  'file_dependency' => 
  array (
    '0884b1192b3579972667424cdce949d2af97dc11' => 
    array (
      0 => 'C:\\wwwroot\\boui\\api\\templates\\payment.tpl',
      1 => 1506062750,
      2 => 'file',
    ),
  ),
  'includes' => 
  array (
  ),
),false)) {
function content_59c4b1a694ccb2_15876314 (Smarty_Internal_Template $_smarty_tpl) {
$_smarty_tpl->_loadInheritance();
$_smarty_tpl->inheritance->init($_smarty_tpl, true);
?>

<?php 
$_smarty_tpl->inheritance->instanceBlock($_smarty_tpl, 'Block_1402559c4b1a6924684_60237971', 'content');
?>

<?php $_smarty_tpl->inheritance->endChild($_smarty_tpl, "layout.tpl");
}
/* {block 'content'} */
class Block_1402559c4b1a6924684_60237971 extends Smarty_Internal_Block
{
public $subBlocks = array (
  'content' => 
  array (
    0 => 'Block_1402559c4b1a6924684_60237971',
  ),
);
public function callBlock(Smarty_Internal_Template $_smarty_tpl) {
?>

	<div id="info" class="overlay">
		<div class="popup">
			<div class="content">
				Redirecting ...
			</div>
		</div>
	</div>

    <form id="paymentForm" name="paymentForm" method="POST" action="<?php echo $_smarty_tpl->tpl_vars['payment']->value->action;?>
">
	<?php
$_from = $_smarty_tpl->smarty->ext->_foreach->init($_smarty_tpl, $_smarty_tpl->tpl_vars['payment']->value->fields, 'field');
if ($_from !== null) {
foreach ($_from as $_smarty_tpl->tpl_vars['field']->value) {
?>
		<input type="hidden" name="<?php echo $_smarty_tpl->tpl_vars['field']->value->name;?>
" value="<?php echo $_smarty_tpl->tpl_vars['field']->value->value;?>
" />
	<?php
}
}
$_smarty_tpl->smarty->ext->_foreach->restore($_smarty_tpl, 1);
?>

	</form>
	
	<?php echo '<script'; ?>
>
		window.onload = function(){
		  //document.paymentForm.submit();
		};	
	<?php echo '</script'; ?>
>
<?php
}
}
/* {/block 'content'} */
}
