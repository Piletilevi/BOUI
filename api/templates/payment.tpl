{extends file="layout.tpl"}
{block name=content}
	<div id="info" class="overlay">
		<div class="logo text-center"><img src="/img/logo.png"></div>
		<div class="popup">
			<div class="content text-center">
				<img class="loading-gif" src="/img/loadingEP.gif">
			</div>
		</div>
	</div>

    <form id="paymentForm" name="paymentForm" method="{$payment->method}" action="{$payment->action}">
	{foreach from=$payment->fields item=field}
		<input type="hidden" name="{$field->name}" value="{$field->value}" />
	{/foreach}
	<input type="submit" value="Submit">
	</form>
	
	<script>
		window.onload = function(){
		  //document.paymentForm.submit();
		};	
	</script>
{/block}
