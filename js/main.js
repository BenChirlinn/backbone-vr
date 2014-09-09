(function() {

backboneVR = {
	Global: {
		radius: 100,
		theta: 0
	},
	DOM: {
		container: null,
		stats: null
	},
	Three: {
		camera: new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 ),
		scene: new THREE.Scene(),
		projector: new THREE.Projector(),
		raycaster: new THREE.Raycaster(),
		renderer: new THREE.WebGLRenderer(),
		intersected: null
	}
};

_.extend( backboneVR, {
	Device: {
		vrEffect: new THREE.VREffect(backboneVR.Three.renderer, function(error) {
			if (error) {
				$('.button').addClass('error').html(error);
			}
		}),
		vrControls: new THREE.VRControls(backboneVR.Three.camera),
		mouse: new THREE.Vector2()
	},

	Model: Backbone.Model.extend({
		defaults: {
			title: '',
			link: '',
			author: '',
			image: ''
		}
	}),
	Collection: Backbone.Collection.extend({
		model: backboneVR.Model
	}),
	View: Backbone.View.extend({
		initialize: function() {
			var light = new THREE.DirectionalLight( 0xffff00, 2 );
			light.position.set( 1, 1, 1 ).normalize();
			backboneVR.Three.scene.add( light );

			light = new THREE.DirectionalLight( 0xffff00 );
			light.position.set( -1, -1, -1 ).normalize();
			backboneVR.Three.scene.add( light );

			var geometry = new THREE.BoxGeometry( 20, 20, 20 );

			for ( var i = 0; i < 500; i ++ ) {

				var object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );

				object.position.x = Math.random() * 800 - 400;
				object.position.y = Math.random() * 800 - 400;
				object.position.z = Math.random() * 800 - 400;

				object.rotation.x = Math.random() * 2 * Math.PI;
				object.rotation.y = Math.random() * 2 * Math.PI;
				object.rotation.z = Math.random() * 2 * Math.PI;

				object.scale.x = 1;
				object.scale.y = 1.6;
				object.scale.z = 0.1;

				backboneVR.Three.scene.add( object );

			}

			backboneVR.Three.renderer.setClearColor( 0xf0f0f0 );
			backboneVR.Three.renderer.setSize( window.innerWidth, window.innerHeight );
			backboneVR.Three.renderer.sortObjects = false;

			$('document').mousemove( function() {
				event.preventDefault();

				backboneVR.Device.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
				backboneVR.Device.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
			} );

			$('window').resize( function() {
				backboneVR.Three.camera.aspect = window.innerWidth / window.innerHeight;
				backboneVR.Three.camera.updateProjectionMatrix();

				backboneVR.Three.renderer.setSize( window.innerWidth, window.innerHeight );
			} );
		},
		template: _.template( $('#main').html() ),

		render: function(eventName) {
			$('body').append( this.template() );

			$('.button').click( function() {
				backboneVR.Device.vrEffect.setFullScreen( true );
			});

			backboneVR.DOM.container = $('.contents');
			console.log(backboneVR.Three.renderer);
			$('.contents').append(backboneVR.Three.renderer.domElement);

			backboneVR.DOM.stats = new Stats();
			backboneVR.DOM.stats.domElement.style.position = 'absolute';
			backboneVR.DOM.stats.domElement.style.top = '0px';
			backboneVR.DOM.container.append( backboneVR.DOM.stats.domElement );

			animate();

			return this;
		},

		renderVR: function() {
			backboneVR.Global.theta += 0.1;

			backboneVR.Three.camera.position.x = backboneVR.Global.radius * Math.sin( THREE.Math.degToRad( backboneVR.Global.theta ) );
			backboneVR.Three.camera.position.y = backboneVR.Global.radius * Math.sin( THREE.Math.degToRad( backboneVR.Global.theta ) );
			backboneVR.Three.camera.position.z = backboneVR.Global.radius * Math.cos( THREE.Math.degToRad( backboneVR.Global.theta ) );
			backboneVR.Three.camera.lookAt( backboneVR.Three.scene.position );

			// find intersections

			var vector = new THREE.Vector3( backboneVR.Device.mouse.x, backboneVR.Device.mouse.y, 1 );
			backboneVR.Three.projector.unprojectVector( vector, backboneVR.Three.camera );

			backboneVR.Three.raycaster.set( backboneVR.Three.camera.position, vector.sub( backboneVR.Three.camera.position ).normalize() );

			var intersects = backboneVR.Three.raycaster.intersectObjects( backboneVR.Three.scene.children );

			if ( intersects.length > 0 ) {

				if ( backboneVR.Three.intersected != intersects[ 0 ].object ) {

					if ( backboneVR.Three.intersected ) backboneVR.Three.intersected.material.emissive.setHex( backboneVR.Three.intersected.currentHex );

					backboneVR.Three.intersected = intersects[ 0 ].object;
					backboneVR.Three.intersected.currentHex = backboneVR.Three.intersected.material.emissive.getHex();
					backboneVR.Three.intersected.material.emissive.setHex( 0xff0000 );

				}

			} else {

				if ( backboneVR.Three.intersected ) backboneVR.Three.intersected.material.emissive.setHex( backboneVR.Three.intersected.currentHex );

				backboneVR.Three.intersected = null;

			}

			backboneVR.Device.vrControls.update();
			backboneVR.Device.vrEffect.render( backboneVR.Three.scene, backboneVR.Three.camera );
		}
	}),

	init: function() {
		this.app = new this.View();
		this.app.render();
	}
});

// Animation loop
function animate() {
	requestAnimationFrame( animate );

	backboneVR.app.renderVR();
	backboneVR.DOM.stats.update();
}

$(document).ready(function () {
	backboneVR.init();
});

})();