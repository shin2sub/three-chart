(function () {

	var self = {};

	var EVENT = {
		
		SELECTED_PAGE : 'selectedPage'
	};

	function cloneSettingModel () {

		/**
		 * 페이징 세팅 정보를 담고 있다.
		 * @type {Object}
		 */
		var settingModel = {

			currentPageIndex : null,

			direction : null,

			position : {
				x : []
			}

		};

		return settingModel;
	}

	/* get random color */

	function getRandomColor() {

	    var letters = '0123456789ABCDEF'.split('');
	    var color = '#';

	    for (var i = 0; i < 6; i++ ) {
	        color += letters[Math.round(Math.random() * 15)];
	    }

	    return color;
	}

	function makeSlide (three) {

		three.group = new THREE.Object3D();		
		three.number = [];

		for ( var i = 0; i < three.slide.length; i++ ) {

			var sideImage = THREE.ImageUtils.loadTexture(
					'../img/side.png');

			var slideImage = THREE.ImageUtils.loadTexture(
					three.slide[i]);

			var sideTexture = new THREE.MeshPhongMaterial({			
					map: sideImage
				});

			var slideTexture = new THREE.MeshPhongMaterial({
					map: slideImage
				});

			var textures = [
								sideTexture, sideTexture, sideTexture, 
								sideTexture, slideTexture, sideTexture
							];

			var cube = new THREE.CubeGeometry(32, 24, 15);

			var meshFaceMaterial = new THREE.MeshFaceMaterial(textures);

			var item = new THREE.Mesh(cube, meshFaceMaterial);

			item.position.x = i * (32 + 5);

			three.settings.position.x.push(item.position.x);

			three.group.add(item);


			var textGeometry = new THREE.TextGeometry((i + 1),{
			    size : 2,
			    height : 0.5
			});

			textGeometry.computeBoundingBox();

			var centerOffset = textGeometry.boundingBox.max.x;

			var textMaterial1 = new THREE.MeshLambertMaterial({ 
			    color : getRandomColor()
			});

			var textMesh = new THREE.Mesh(textGeometry, textMaterial1);
			
			textMesh.position.x = i * (32 + 5) + 11;
			textMesh.position.y = 12;
			textMesh.position.z = 10;

			textMesh.rotation.x = 0.3;

			three.group.add(textMesh);
			three.number.push(textMesh);

		}

		three.scene.add(three.group);
	}

	function render (three) {

		for (var i = 0; i < three.subItems.length; i++ ) {

			three.subItems[i].rotation.x += 0.02;
			three.subItems[i].rotation.y += 0.02;
		}

		if (three.settings.direction == 'right') {

			var x = - three.settings.position.x[three.settings.currentPageIndex];
			
			if (three.group.position.x >= x) {

				three.group.position.x -= 0.7;
			}	

		} else if (three.settings.direction == 'left') {

			var x = -three.settings.position.x[three.settings.currentPageIndex];

			if (three.group.position.x <= x) {

				three.group.position.x += 0.7;
			}
		}

		three.animate = requestAnimationFrame(function () {

			return render(three);
		});

		three.renderer.render(three.scene, three.camera);
	}
	
	function bindEvents (wrapper, three) {

		var pageX = 0;
		var projector = new THREE.Projector();
		
		wrapper[0].addEventListener('mousedown', onDocumentMouseDown);
		wrapper[0].addEventListener('mousewheel', onDocumentMouseWheel);

		function onDocumentMouseDown( e ) {

			pageX = e.pageX;

			e.preventDefault();
			
			wrapper[0].addEventListener('mousemove', onDocumentMouseMove);
			wrapper[0].addEventListener('mouseup', onDocumentMouseUp);
			wrapper[0].addEventListener('mouseout', onDocumentMouseOut);	
		}

		function onDocumentMouseMove( e ) {

		}

		function onDocumentMouseUp( e ) {
			
			var movePageX = e.pageX;

			if (pageX < movePageX) {
				
				if (three.settings.currentPageIndex > 0) {

					three.settings.currentPageIndex = three.settings.currentPageIndex - 1;
					three.settings.direction = "left";
				}

			} else {
				
				if (three.settings.currentPageIndex < three.slide.length - 1) {

					three.settings.currentPageIndex = three.settings.currentPageIndex + 1;
					three.settings.direction = "right";
				}
			}

			three.event.trigger(EVENT.SELECTED_PAGE, three);

			wrapper[0].removeEventListener('mousemove', onDocumentMouseMove);
			wrapper[0].removeEventListener('mouseup', onDocumentMouseUp);
			wrapper[0].removeEventListener('mouseout', onDocumentMouseOut);
		}

		function onDocumentMouseOut( e ) {
			
			wrapper[0].removeEventListener('mousemove', onDocumentMouseMove);
			wrapper[0].removeEventListener('mouseup', onDocumentMouseUp);
			wrapper[0].removeEventListener('mouseout', onDocumentMouseOut);
		}

		function onDocumentMouseWheel( e ) {
			
			three.camera.fov -= e.wheelDeltaY * 0.03;
			three.camera.updateProjectionMatrix();
		}

		var ENTER = 13;
		var KEYUP = 38;
        var KEYDOWN = 40;
        var KEYLEFT = 37;
        var KEYRIGHT = 39;
        var Z_ROT_INC = 81;
        var Z_ROT_DEC = 87;
        var VIEW_INCREMENT = 0.1;

		document.addEventListener('keydown', function(e) {
            
            var key = e.keyCode;
            
            switch( key ) {

            	case ENTER:

            	
                    break;
                    
                case KEYUP:

                    if ( three.camera.rotation.x < 90 ) {

                        three.camera.rotation.x += VIEW_INCREMENT;
                    }
                    break;
                    
                case KEYDOWN:
                    
                    if ( three.camera.rotation.x > -90 ) {

                        three.camera.rotation.x -= VIEW_INCREMENT;
                    }
                    break;
                    
                case KEYLEFT:
                
                	if (three.settings.currentPageIndex > 0) {

						three.settings.currentPageIndex = three.settings.currentPageIndex - 1;
						three.settings.direction = "left";
					}

                    // three.camera.rotation.y += VIEW_INCREMENT;
                    break;
                    
                case KEYRIGHT:

            		if (three.settings.currentPageIndex < three.slide.length - 1) {

						three.settings.currentPageIndex = three.settings.currentPageIndex + 1;
						three.settings.direction = "right";
					}

                    // three.camera.rotation.y -= VIEW_INCREMENT;
                    break;
                    
                case Z_ROT_INC:
                	
                    three.camera.position.z += VIEW_INCREMENT;
                    break;
                    
                case Z_ROT_DEC:
                
                    three.camera.position.z -= VIEW_INCREMENT;
                    break;
                    
            }
            
            
        });

		three.event.on(EVENT.SELECTED_PAGE, function (e, three) {
			
			// console.log(three.settings.currentPageIndex)
		})
	}


	function setup (wrapper, three) {

		three.settings = cloneSettingModel();

		/* renderer */
		three.renderer = window.WebGLRenderingContext ? new THREE.WebGLRenderer() : new THREE.CanvasRenderer();
		// three.renderer = new THREE.WebGLRenderer();
		three.renderer.setSize( window.innerWidth, window.innerHeight );
		three.renderer.physicallyBasedShading = true;
		three.renderer.domElement.style.position = 'absolute';
		three.renderer.domElement.style.top	= 0;
		three.renderer.domElement.style.zIndex = -1;

		/* scene */
		three.scene = new THREE.Scene();

		/* camera*/
		three.camera = new THREE.PerspectiveCamera( 
				40, window.innerWidth / window.innerHeight, 0.1, 1000 );
		three.camera.position.set( 0, 0, 50 );
		three.camera.lookAt(three.scene.position );

		/* right */
		three.light = new THREE.PointLight();
		three.light.position.set( 0, 0, 50 );
		three.light.lookAt(three.scene.position);
		
		three.scene.add(three.light);

		three.domEvents = new THREEx.DomEvents(three.camera, three.renderer.domElement);

		wrapper.append(three.renderer.domElement);
	}

	function addApis (three) {

		three.on = function (eventName, callback) {

			three.event.on(eventName, callback);
		};

	
	}

	function makeSubItems (three) {

		three.subItems = [];

		var positionArr = three.settings.position.x;

		var geometry1 = new THREE.SphereGeometry(2, 150, 150);
		var material1 = new THREE.MeshPhongMaterial({
			color: 0x5f82fe
		});

		var mesh1 = new THREE.Mesh(geometry1, material1);

		mesh1.position.z = 12;
		mesh1.position.x = positionArr[8] - 8;
		mesh1.position.y = -14;

		three.group.add(mesh1);

		var geometry2 = new THREE.CubeGeometry(2.5, 2.5, 2.5);
		var material2 = new THREE.MeshPhongMaterial({
			color: 0x5f82fe
		});

		var mesh2 = new THREE.Mesh(geometry2, material2);

		mesh2.position.z = 12;
		mesh2.position.x = positionArr[8] - 0;
		mesh2.position.y = -14;

		mesh2.rotation.x = 0.2;
		mesh2.rotation.y = -0.2;
		
		three.group.add(mesh2);

		var geometry3 = new THREE.CylinderGeometry(1.8, 1.8, 2, 32);
		var material3 = new THREE.MeshPhongMaterial({
			color: 0x5f82fe
		});

		var mesh3 = new THREE.Mesh(geometry3, material3);

		mesh3.position.z = 12;
		mesh3.position.x = positionArr[8] + 8;
		mesh3.position.y = -14;

		three.group.add(mesh3);

		three.subItems.push(mesh1, mesh2, mesh3);


		var geometry4 = new THREE.CubeGeometry(2.5, 2.5, 2.5);
		var material4 = new THREE.MeshBasicMaterial({
			color: 0x5f82fe
		});

		var mesh4 = new THREE.Mesh(geometry4, material4);

		mesh4.position.z = 12;
		mesh4.position.x = positionArr[9] - 8;
		mesh4.position.y = -14;

		three.group.add(mesh4);


		var geometry5 = new THREE.CubeGeometry(2.5, 2.5, 2.5);
		var material5 = new THREE.MeshLambertMaterial({
			color: 0x5f82fe
		});

		var mesh5 = new THREE.Mesh(geometry5, material5);

		mesh5.position.z = 12;
		mesh5.position.x = positionArr[9] - 0;
		mesh5.position.y = -14;

		mesh5.rotation.x = 0.2;
		mesh5.rotation.y = -0.2;
		
		three.group.add(mesh5);

		var geometry6 = new THREE.CubeGeometry(2.5, 2.5, 2.5);
		var material6 = new THREE.MeshNormalMaterial({
			color: 0x5f82fe
		});

		var mesh6 = new THREE.Mesh(geometry6, material6);

		mesh6.position.z = 12;
		mesh6.position.x = positionArr[9] + 8;
		mesh6.position.y = -14;

		three.group.add(mesh6);

		three.subItems.push(mesh4, mesh5, mesh6);

	}

	self.init = function (wrapper, slide) {

		var three = {};

		three.event = $({});

		three.slide = slide;

		three.positionZ = 0;

		setup(wrapper, three);
		
		makeSlide(three);
		
		makeSubItems(three);

		render(three);

		bindEvents(wrapper, three);
	
		addApis(three);
	     

		return three;
	};



	window.three = self;

})();

