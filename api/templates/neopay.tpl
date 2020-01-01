{extends file="layout.tpl"}
{block name=content}
	<script type="text/javascript" src="https://widget.neopay.lt/widget.js"></script>

	<script>
		window.onload = function(){
		    var NEOWidgetHost = "https://widget.neopay.lt";
			{foreach from=$payment->fields item=field}
			{if $field->name == 'token'}
			var data = "{$field->value}";
			{/if}
			{/foreach}
			NEOWidget.initialize(
				NEOWidgetHost,
				data,
				{literal}{{/literal}
				{foreach from=$payment->fields item=field name=fldLoop}
				{if $field->name != 'token'}
					'{$field->name}': '{$field->value}'{if not $smarty.foreach.fldLoop.last},{/if}
				{/if}
				{/foreach}
				{literal}}{/literal}
			);
		};	
	</script>
{/block}
