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
					{if isset($field->type) && $field->type == 'array'}
						'{$field->name}': [
						{foreach from=$field->value item=value name=valLoop}
						'{$value}'{if not $smarty.foreach.valLoop.last},{/if}
						{/foreach}
						]{if not $smarty.foreach.fldLoop.last},{/if}
					{else}
					'{$field->name}': '{$field->value}'{if not $smarty.foreach.fldLoop.last},{/if}
					{/if}
				{/if}
				{/foreach}
				{literal}}{/literal}
			);
		};	
	</script>
{/block}
