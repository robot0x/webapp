$(function() {
	var
		doc = document,
		login = doc.querySelector(".login"),
		loginBox = doc.querySelector(".login-box"),
		mask = doc.querySelector(".mask"),
		loginClose = doc.querySelector(".login-close"),
		loginMethod = loginBox.querySelectorAll(".login-method a"),
		$mask = $(mask),
		$loginClose = $(loginClose),
		$loginBox = $(loginBox),
		$loginMethod = $(loginMethod),
		$login = $(login);

	function close() {
		$mask.toggleClass("disnone");
		$loginBox.animate({
			top: -401
		}, function() {
			$loginBox.toggleClass("disnone");
		})
	}
	$mask.on('click', close);
	$loginClose.on('click', close);
	$login.on("click", function() {
		$mask.toggleClass("disnone");
		$loginBox.toggleClass("disnone");
		$loginBox.animate({
			top: 100
		})
	});
	$loginMethod.on('click', function() {
		alert(this.innerHTML);
	})
})