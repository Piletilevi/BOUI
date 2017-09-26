{extends file="layout.tpl"}
{block name=content}
	<div id="info" class="overlay">
		<div class="popup">
			<div class="content text-center">
				Redirecting ...
			</div>
		</div>
	</div>

    <form id="paymentForm" name="paymentForm" method="{$payment->method}" action="{$payment->action}">
	{foreach from=$payment->fields item=field}
		<input type="hidden" name="{$field->name}" value="{$field->value}" />
	{/foreach}
	</form>
	
	<script>
		window.onload = function(){
		  //document.paymentForm.submit();
		};	
	</script>
{/block}
