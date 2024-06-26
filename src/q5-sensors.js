/* Adds mobile device accelerometer and gyroscope input */
Q5.modules.sensors = ($) => {
	$.accelerationX = 0;
	$.accelerationY = 0;
	$.accelerationZ = 0;
	$.rotationX = 0;
	$.rotationY = 0;
	$.rotationZ = 0;
	$.relRotationX = 0;
	$.relRotationY = 0;
	$.relRotationZ = 0;
	$.pAccelerationX = 0;
	$.pAccelerationY = 0;
	$.pAccelerationZ = 0;
	$.pRotationX = 0;
	$.pRotationY = 0;
	$.pRotationZ = 0;
	$.pRelRotationX = 0;
	$.pRelRotationY = 0;
	$.pRelRotationZ = 0;

	$.hasSensorPermission =
		(!window.DeviceOrientationEvent && !window.DeviceMotionEvent) ||
		!(DeviceOrientationEvent.requestPermission || DeviceMotionEvent.requestPermission);
	$.requestSensorPermissions = () => {
		if (DeviceOrientationEvent.requestPermission) {
			DeviceOrientationEvent.requestPermission()
				.then((response) => {
					if (response == 'granted') {
						if (DeviceMotionEvent.requestPermission) {
							DeviceMotionEvent.requestPermission()
								.then((response) => {
									if (response == 'granted') {
										$.hasSensorPermission = true;
									}
								})
								.catch(alert);
						}
					}
				})
				.catch(alert);
		}
	};

	let ROTX = (a) => [1, 0, 0, 0, 0, $.cos(a), -$.sin(a), 0, 0, $.sin(a), $.cos(a), 0, 0, 0, 0, 1];
	let ROTY = (a) => [$.cos(a), 0, $.sin(a), 0, 0, 1, 0, 0, -$.sin(a), 0, $.cos(a), 0, 0, 0, 0, 1];
	let MULT = (A, B) => [
		A[0] * B[0] + A[1] * B[4] + A[2] * B[8] + A[3] * B[12],
		A[0] * B[1] + A[1] * B[5] + A[2] * B[9] + A[3] * B[13],
		A[0] * B[2] + A[1] * B[6] + A[2] * B[10] + A[3] * B[14],
		A[0] * B[3] + A[1] * B[7] + A[2] * B[11] + A[3] * B[15],
		A[4] * B[0] + A[5] * B[4] + A[6] * B[8] + A[7] * B[12],
		A[4] * B[1] + A[5] * B[5] + A[6] * B[9] + A[7] * B[13],
		A[4] * B[2] + A[5] * B[6] + A[6] * B[10] + A[7] * B[14],
		A[4] * B[3] + A[5] * B[7] + A[6] * B[11] + A[7] * B[15],
		A[8] * B[0] + A[9] * B[4] + A[10] * B[8] + A[11] * B[12],
		A[8] * B[1] + A[9] * B[5] + A[10] * B[9] + A[11] * B[13],
		A[8] * B[2] + A[9] * B[6] + A[10] * B[10] + A[11] * B[14],
		A[8] * B[3] + A[9] * B[7] + A[10] * B[11] + A[11] * B[15],
		A[12] * B[0] + A[13] * B[4] + A[14] * B[8] + A[15] * B[12],
		A[12] * B[1] + A[13] * B[5] + A[14] * B[9] + A[15] * B[13],
		A[12] * B[2] + A[13] * B[6] + A[14] * B[10] + A[15] * B[14],
		A[12] * B[3] + A[13] * B[7] + A[14] * B[11] + A[15] * B[15]
	];
	let TRFM = (A, v) => [
		(A[0] * v[0] + A[1] * v[1] + A[2] * v[2] + A[3]) / (A[12] * v[0] + A[13] * v[1] + A[14] * v[2] + A[15]),
		(A[4] * v[0] + A[5] * v[1] + A[6] * v[2] + A[7]) / (A[12] * v[0] + A[13] * v[1] + A[14] * v[2] + A[15]),
		(A[8] * v[0] + A[9] * v[1] + A[10] * v[2] + A[11]) / (A[12] * v[0] + A[13] * v[1] + A[14] * v[2] + A[15])
	];

	window.addEventListener('deviceorientation', (e) => {
		$.pRotationX = $.rotationX;
		$.pRotationY = $.rotationY;
		$.pRotationZ = $.rotationZ;
		$.pRelRotationX = $.relRotationX;
		$.pRelRotationY = $.relRotationY;
		$.pRelRotationZ = $.relRotationZ;

		$.rotationX = e.beta * (Math.PI / 180.0);
		$.rotationY = e.gamma * (Math.PI / 180.0);
		$.rotationZ = e.alpha * (Math.PI / 180.0);
		$.relRotationX = [-$.rotationY, -$.rotationX, $.rotationY][Math.trunc(window.orientation / 90) + 1];
		$.relRotationY = [-$.rotationX, $.rotationY, $.rotationX][Math.trunc(window.orientation / 90) + 1];
		$.relRotationZ = $.rotationZ;
	});

	window.addEventListener('devicemotion', (e) => {
		$.pAccelerationX = $.accelerationX;
		$.pAccelerationY = $.accelerationY;
		$.pAccelerationZ = $.accelerationZ;
		if (!e.acceleration) {
			let grav = TRFM(MULT(ROTY($.rotationY), ROTX($.rotationX)), [0, 0, -9.80665]);
			$.accelerationX = e.accelerationIncludingGravity.x + grav[0];
			$.accelerationY = e.accelerationIncludingGravity.y + grav[1];
			$.accelerationZ = e.accelerationIncludingGravity.z - grav[2];
		}
	});
};
