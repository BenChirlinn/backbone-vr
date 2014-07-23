(function() {

wiredVR = {
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

_.extend( wiredVR, {
	Device: {
		vrEffect: new THREE.VREffect(wiredVR.Three.renderer, function(error) {
			if (error) {
				$('.button').addClass('error').html(error);
			}
		}),
		vrControls: new THREE.VRControls(wiredVR.Three.camera),
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
		model: wiredVR.Model
	}),
	View: Backbone.View.extend({
		initialize: function() {
			var light = new THREE.DirectionalLight( 0xffff00, 2 );
			light.position.set( 1, 1, 1 ).normalize();
			wiredVR.Three.scene.add( light );

			light = new THREE.DirectionalLight( 0xffff00 );
			light.position.set( -1, -1, -1 ).normalize();
			wiredVR.Three.scene.add( light );

			var geometry = new THREE.BoxGeometry( 20, 20, 20 );

			for ( var i = 0; i < 500; i ++ ) {

				var object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );

				object.position.x = Math.random() * 800 - 400;
				object.position.y = Math.random() * 800 - 400;
				object.position.z = Math.random() * 800 - 400;

				object.rotation.x = Math.random() * 2 * Math.PI;
				object.rotation.y = Math.random() * 2 * Math.PI;
				object.rotation.z = Math.random() * 2 * Math.PI;

				object.scale.x = Math.random() + 0.5;
				object.scale.y = Math.random() + 0.5;
				object.scale.z = Math.random() + 0.5;

				wiredVR.Three.scene.add( object );

			}

			wiredVR.Three.renderer.setClearColor( 0xf0f0f0 );
			wiredVR.Three.renderer.setSize( window.innerWidth, window.innerHeight );
			wiredVR.Three.renderer.sortObjects = false;

			$('document').mousemove( function() {
				event.preventDefault();

				wiredVR.Device.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
				wiredVR.Device.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
			} );

			$('window').resize( function() {
				wiredVR.Three.camera.aspect = window.innerWidth / window.innerHeight;
				wiredVR.Three.camera.updateProjectionMatrix();

				wiredVR.Three.renderer.setSize( window.innerWidth, window.innerHeight );
			} );
		},
		template: _.template( $('#main').html() ),

		render: function(eventName) {
			$('body').append( this.template() );

			$('.button').click( function() {
				vrEffect.setFullScreen( true );
			});

			wiredVR.DOM.container = $('.contents');
			console.log(wiredVR.Three.renderer);
			$('.contents').append(wiredVR.Three.renderer.domElement);

			wiredVR.DOM.stats = new Stats();
			wiredVR.DOM.stats.domElement.style.position = 'absolute';
			wiredVR.DOM.stats.domElement.style.top = '0px';
			wiredVR.DOM.container.append( wiredVR.DOM.stats.domElement );

			animate();

			return this;
		},

		renderVR: function() {
			wiredVR.Global.theta += 0.1;

			wiredVR.Three.camera.position.x = wiredVR.Global.radius * Math.sin( THREE.Math.degToRad( wiredVR.Global.theta ) );
			wiredVR.Three.camera.position.y = wiredVR.Global.radius * Math.sin( THREE.Math.degToRad( wiredVR.Global.theta ) );
			wiredVR.Three.camera.position.z = wiredVR.Global.radius * Math.cos( THREE.Math.degToRad( wiredVR.Global.theta ) );
			wiredVR.Three.camera.lookAt( wiredVR.Three.scene.position );

			// find intersections

			var vector = new THREE.Vector3( wiredVR.Device.mouse.x, wiredVR.Device.mouse.y, 1 );
			wiredVR.Three.projector.unprojectVector( vector, wiredVR.Three.camera );

			wiredVR.Three.raycaster.set( wiredVR.Three.camera.position, vector.sub( wiredVR.Three.camera.position ).normalize() );

			var intersects = wiredVR.Three.raycaster.intersectObjects( wiredVR.Three.scene.children );

			if ( intersects.length > 0 ) {

				if ( wiredVR.Three.intersected != intersects[ 0 ].object ) {

					if ( wiredVR.Three.intersected ) wiredVR.Three.intersected.material.emissive.setHex( wiredVR.Three.intersected.currentHex );

					wiredVR.Three.intersected = intersects[ 0 ].object;
					wiredVR.Three.intersected.currentHex = wiredVR.Three.intersected.material.emissive.getHex();
					wiredVR.Three.intersected.material.emissive.setHex( 0xff0000 );

				}

			} else {

				if ( wiredVR.Three.intersected ) wiredVR.Three.intersected.material.emissive.setHex( wiredVR.Three.intersected.currentHex );

				wiredVR.Three.intersected = null;

			}

			wiredVR.Device.vrControls.update();
			wiredVR.Device.vrEffect.render( wiredVR.Three.scene, wiredVR.Three.camera );
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

	wiredVR.app.renderVR();
	wiredVR.DOM.stats.update();
}

$(document).ready(function () {
	wiredVR.init();
});

})();