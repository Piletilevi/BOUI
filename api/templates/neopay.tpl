{extends file="layout.tpl"}
{block name=content}
	<script type="text/javascript" src="https://widget.neopay.lt/widget.js"></script>

	<script>
		window.onload = function(){
		    var NEOWidgetHost = "https://widget.neopay.lt";
			var data = "{$payment->fields[0]->value}";
			NEOWidget.initialize(
				NEOWidgetHost,
				data
			);
		};	
	</script>
{/block}
