{extends file="layout.tpl"}
{block name=content}
	<script type="text/javascript" src="https://widget.neopay.lt/widget.js"></script>

	<div id="info" class="overlay">
		<div class="logo text-center"><img src="/img/logo.png"></div>
		<div class="popup">
			<div class="content text-center">
				<img class="loading-gif" src="/img/loadingEP.gif">
			</div>
		</div>
	</div>

	<script>
		window.onload = function(){
		    var NEOWidgetHost = "https://widget.neopay.lt";
			var data = "{$payment->fields[0]->value}";
			NEOWidget.initialize(
				NEOWidgetHost,
				data,
				{'css':'yours_css_url.css'}
			);
		};	
	</script>
{/block}
