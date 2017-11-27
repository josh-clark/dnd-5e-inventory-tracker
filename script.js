(function ($) {
	function loadValues() {
		// Load the values from the URL query parameters.
	}

	function saveValues() {
		// Load the values to the URL query parameters.
	}

	function calculateCharacter() {
		var strength = $("#character__score").val();
		var sizeMultiplier = $("#character__size-multiplier").val();
		var multiplier = $("#character__multiplier").val();
		var capacity = strength * sizeMultiplier * multiplier;
		$("#character__capacity").val(capacity);
	}

	function calculateInventory() {
		var $this = $(this);
		var weight = $this.find(".inventory__item--weight--field").val();
		var quantity = $this.find(".inventory__item--quantity--field").val();
		var subtotal = weight * quantity;
		$this.find(".inventory__item--subtotal--field").val(subtotal);
	}

	function calculateTotal() {
		var capacity = $("#character__capacity").val();
		var total = 0;
		$(".inventory__item--subtotal--field").each(function () {
			total += parseInt(this.value, 10);
		});
		$(".total__weight--field").val(total);

		var progress = total / capacity;
		var difference = capacity - total;
		$(".total__progress--bar").width((progress * 100) + "%");
		$(".total__progress--percentage").text(Math.round(progress * 100) + "%");

		if (difference >= 0) {
			$(".total__progress--remaining").text(difference + " remaining");
			$(".total__progress--bar-error").width("0");
		}
		else {
			$(".total__progress--remaining").text((-1 * difference) + " overburdened");
			$(".total__progress--bar-error").width(((progress - 1) * 100) + "%");
		}
	}

	function calculate() {
		calculateCharacter();
		$(".inventory__item").each(calculateInventory);
		calculateTotal();
		saveValues();
	}

	$(document).ready(function () {
		loadValues();
		$(".field").on("input change", calculate);
		calculate();
	});
})(jQuery);
