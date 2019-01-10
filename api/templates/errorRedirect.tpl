{extends file="layout.tpl"}
{block name=content}
	<div id="info" class="overlay">
		<div class="logo text-center"><img src="/img/logo.png"></div>
		<div class="popup">
			<div class="content text-center">
				{if isset($error->message) }
					<span>{$error->message}</span>
                {else}
                    <span>Error processing payment</span>
				{/if}
                <br>
				<span id="counter"></span>
			</div>
		</div>
	</div>
	
	<script>
		window.onload = function(){
            var counter = 5;
            var interval = setInterval(function() {
                document.getElementById("counter").innerHTML = counter.toString();
                if (counter == 0) {
                    {if isset($error->errorRedirectUrl) }
                        window.location.replace("{$error->errorRedirectUrl}");
                    {else} window.location.replace("https://www.piletilevi.ee");
                    {/if}
                    clearInterval(interval);
                }
                if (counter > 0) counter--;


            }, 1000);
		};	
	</script>
{/block}
