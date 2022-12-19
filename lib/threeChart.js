(function () {

	var self = {};

	var EVENT = {};

	function cloneSettingModel () {

		/**
		 * 페이징 세팅 정보를 담고 있다.
		 * @type {Object}
		 */
		var settingModel = {};

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


	function render (three) {

		three.animate = requestAnimationFrame(function () {

			return render(three);
		});

		three.renderer.render(three.scene, three.camera);
	}
	
	function bindEvents (wrapper, three) {

		var doc = document;

		var targetRotationX = 0;
        var targetRotationY = 0;
        var targetRotationOnMouseDownX = 0;
        var targetRotationOnMouseDownY = 0;

        var mouseX = 0;
        var mouseY = 0;
        var mouseXOnMouseDown = 0;
        var mouseYOnMouseDown = 0;

        var windowHalfX = 0;
        var windowHalfY = 0;

		doc.addEventListener('mousedown', onDocumentMouseDown, false);
        doc.addEventListener('mousewheel', onDocumentMouseWheel, false);
        window.addEventListener('resize', onWindowResize, false);


        function onWindowResize() {
           
            windowHalfX = window.innerWidth / 2;
            windowHalfY = window.innerHeight / 2;
            three.camera.aspect = window.innerWidth / window.innerHeight;
            three.camera.updateProjectionMatrix();
            three.renderer.setSize(window.innerWidth, window.innerHeight);
        }

        function onDocumentMouseDown(event) {
            
            event.preventDefault();

            doc.addEventListener('mousemove', onDocumentMouseMove, false);
            doc.addEventListener('mouseup', onDocumentMouseUp, false);
            doc.addEventListener('mouseout', onDocumentMouseOut, false);
           
            mouseXOnMouseDown = event.clientX - windowHalfX;
            mouseYOnMouseDown = event.clientY - windowHalfY;
            targetRotationOnMouseDownX = targetRotationX;
            targetRotationOnMouseDownY = targetRotationY;
        }

        function onDocumentMouseMove(event) {
            
            mouseX = event.clientX - windowHalfX;
            mouseY = event.clientY - windowHalfY;
            targetRotationX = targetRotationOnMouseDownX + (mouseX - mouseXOnMouseDown) * 0.01;
            targetRotationY = targetRotationOnMouseDownY + (mouseY - mouseYOnMouseDown) * 0.01;
      
            three.group.rotation.x += (targetRotationY - three.group.rotation.x) * 0.05;
            three.group.rotation.y += (targetRotationX - three.group.rotation.y) * 0.05;
        }

        function onDocumentMouseUp(event) {
           
            doc.removeEventListener('mousemove', onDocumentMouseMove, false);
            doc.removeEventListener('mouseup', onDocumentMouseUp, false);
            doc.removeEventListener('mouseout', onDocumentMouseOut, false);
        }

        function onDocumentMouseOut(event) {
           
            doc.removeEventListener('mousemove', onDocumentMouseMove, false);
            doc.removeEventListener('mouseup', onDocumentMouseUp, false);
            doc.removeEventListener('mouseout', onDocumentMouseOut, false);
        }

        function onDocumentMouseWheel(event) {
           
            three.camera.fov -= event.wheelDeltaY * 0.03;
            three.camera.updateProjectionMatrix();
        }

	}

    function setSeriesDataMap (three) {

        var options = three.options;
        var seriesLength = _.size(options.series);
        var seriesDataArray = {};

        for ( var i = 0; i < seriesLength; i++ ) {

            seriesDataArray['s' + (i + 1)] = [];

            for (var j = 0; j < three.data.length; j++ ) {

                var seriesData = three.data[j][options.series['s' + (i + 1)]];
                
                seriesDataArray['s' + (i + 1)].push(seriesData);
            }
        }

        var maxArr = [];
        var minArr = [];

        _.each(seriesDataArray, function (num) {

            maxArr.push(_.max(num));
            minArr.push(_.min(num));

        })

        three.max = _.max(maxArr);
        three.min = _.min(minArr);

        three.seriesDataMap = seriesDataArray;
    }	

	function createChart (three) {

		makeChartBase(three);

        makeYAxis(three);

        makeXAixs(three);

        makeZText(three);

        drawLineChart(three);
	}

	function drawLineChart (three) {

		var styles = three.styles;
		var options = three.options;
		var seriesLength = _.size(options.series);
        var zGap = styles.faceZ / seriesLength;
        var startZ = zGap / 2;
        var xGap = styles.faceX / three.data.length;
        var startX = xGap / 2;

        var grafix = styles.faceY / 100 / (14000 - three.min) * 100;

        var i = 0;

        _.each(three.seriesDataMap, function (num) {

            var geometry = new THREE.PlaneGeometry(
                        (styles.faceX - xGap), 20, (three.data.length - 1), 1);

            var material = new THREE.MeshBasicMaterial({
                color: styles.linecolor[i],
                emissive: true,
                side: THREE.DoubleSide
            });
            
            var mesh = new THREE.Mesh(geometry, material);
            
            mesh.rotation.x = - Math.PI / 2;

            mesh.position.x = mesh.position.x;
            mesh.position.z = startZ + zGap * i;
            mesh.position.y = -styles.faceY / 2 + 1;

            for (var j = 0; j < num.length; j++ ) {
            
                var vertices = mesh.geometry.vertices;
                var lineMoveY = grafix * (num[j] - three.min);
                
                vertices[j].z = lineMoveY;
                vertices[j + (num.length)].z = lineMoveY;
            }

            three.group.add(mesh);

            i ++;
        })
          
	}

	function makeChartBase (three) {

		var styles = three.styles;

		/*뒷 면*/
		var backfaceGeometry = new THREE.CubeGeometry(styles.faceX, styles.faceY, 1);
        var backfaceMaterial = new THREE.MeshPhongMaterial({
            color: "#737dfb",
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.5
        });

        var backfaceMesh = new THREE.Mesh(backfaceGeometry, backfaceMaterial);

		three.group.add(backfaceMesh);

        /*아랫 면*/
		var underfaceGeometry = new THREE.CubeGeometry(styles.faceX, 1, styles.faceY);
        var underfaceMaterial = new THREE.MeshPhongMaterial({
            color: "#737dfb",
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.5
        });

        var underfaceMesh = new THREE.Mesh(underfaceGeometry, underfaceMaterial);
        underfaceMesh.position.z = styles.faceZ / 2;
		underfaceMesh.position.y = -styles.faceY / 2;

        three.group.add(underfaceMesh);
	}

    function makeYAxis (three) {

    	var styles = three.styles;
        var grafix = styles.faceY / 100 / (three.max - three.min) * 100;
        var maxY = 14000;
        var yAxisTextArry = [];

        for ( var i = 1; i <= 7; i++ ) {

            yAxisTextArry.push(maxY / 7 * i);
        }

        var yGap = styles.faceY / (yAxisTextArry.length);

        for (var i = 0; i < yAxisTextArry.length; i++ ) {

            var geometry = new THREE.CubeGeometry(3, 3, 30);
            var material = new THREE.MeshPhongMaterial({
                color: "#1ceda1",
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 1
            });
            var mesh = new THREE.Mesh(geometry, material);
            mesh.position.x = styles.faceX / 2;
            mesh.position.y = -styles.faceY / 2 + i * yGap + yGap;
            mesh.position.z = 150;

            three.group.add(mesh);

            var geometry = new THREE.TextGeometry(yAxisTextArry[i], {
                size: 15,
                height: 2
            });

            geometry.computeBoundingBox();
            
            var centerOffset = geometry.boundingBox.max.y;
            
            var material = new THREE.MeshBasicMaterial({
                color: "#1ceda1"
            });
           
            var mesh = new THREE.Mesh(geometry, material);
            
            mesh.position.y = -styles.faceY / 2 + i * yGap + yGap - centerOffset / 2;
            mesh.position.x = styles.faceX / 2 + 15;
            mesh.position.z = 150;

            mesh.rotation.y = -0.6

            three.group.add(mesh);
        }
        
        var geometry = new THREE.CubeGeometry(1, styles.faceY, 1);
        var material = new THREE.MeshPhongMaterial({
            color: "#1ceda1",
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 1
        });
        var mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = styles.faceX / 2;
        mesh.position.z = 150;
        
        three.group.add(mesh);
    }

    function makeXAixs (three) {

    	var data = three.data;
    	var styles = three.styles;
    	var options = three.options;
    	var dataLength = data.length;
    	var xGap = styles.faceX / dataLength;
    	var startX = -styles.faceX / 2 + (xGap / 2);

    	for (var i = dataLength; i--;) {

    	    /* 뒷 면 x 좌표 line */
    	    var geometry = new THREE.CubeGeometry(3, styles.faceY, 1);
    	    var material = new THREE.MeshBasicMaterial({
    	        color: "#577afc",
    	        opacity: 0.8
    	    });
    	   	var mesh = new THREE.Mesh(geometry, material);
    	    mesh.position.x = startX + i * (xGap);
    	    
    	    three.group.add(mesh);

    	    /* 밑 면 x 좌표 line */
    	    var geometry = new THREE.CubeGeometry(3, 1, styles.faceZ);
    	    var material = new THREE.MeshPhongMaterial({
    	        color: "#577afc",
    	        opacity: 0.8
    	    });
    	    var mesh = new THREE.Mesh(geometry, material);
    	    mesh.position.x = startX + i * (xGap);
    	    mesh.position.y = -styles.faceY / 2;
    	    mesh.position.z = styles.faceZ / 2;
    	    
    	    three.group.add(mesh);

    	    /* x 좌표 text */
    	    var geometry = new THREE.TextGeometry(data[i][options.xAxis], {
    	        size: 10,
    	        height: 1
    	    });
    	    geometry.computeBoundingBox();

    	    var centerOffset = geometry.boundingBox.max.x;

    	    var material = new THREE.MeshBasicMaterial({
    	        color: "#6fe66f"
    	    });
    	    var mesh = new THREE.Mesh(geometry, material);

    	    mesh.position.x = startX + i * (xGap) - centerOffset / 2;
    	    mesh.position.y = styles.faceY / 2 + 10;
    	    
    	    three.group.add(mesh);

    	}
    }

    function makeZText (three) {

    	var options = three.options;
    	var styles = three.styles;
    	var seriesLength = _.size(options.series);
    	var zGap = styles.faceZ / seriesLength;
    	var startZ = -styles.faceZ / 2 - zGap / 2;
    	
    	for (var i = 0; i < seriesLength; i++) {
    	    
    	    var text = options.series['s'+ (i+1)];
    	    
    	    var geometry = new THREE.TextGeometry(text, {
    	        size: 15,
    	        height: 2
    	    });

    	    geometry.computeBoundingBox();
    	    
    	    var centerOffset = geometry.boundingBox.max.x;
    	    
    	    var material = new THREE.MeshBasicMaterial({
    	        color: styles.linecolor[i]
    	    });
    	   
    	   	var mesh = new THREE.Mesh(geometry, material);
    	    
    	    mesh.position.x = -styles.faceX / 2 - centerOffset - 15;
    	    mesh.position.y = -styles.faceY / 2;
    	    mesh.position.z = - styles.faceZ / 2 - startZ + zGap * i;
    	   
    	   	three.group.add(mesh);
    	}
    }

    function setup (wrapper, three, styles, options, data) {

        three.styles = styles;
        three.options = options;
        three.data = data;

        setSeriesDataMap(three);

        three.settings = cloneSettingModel();

        /* renderer */
        three.renderer = window.WebGLRenderingContext ? new THREE.WebGLRenderer() : new THREE.CanvasRenderer();
        three.renderer.setSize( window.innerWidth, window.innerHeight );
        three.renderer.physicallyBasedShading = true;
        three.renderer.domElement.style.position = 'absolute';
        three.renderer.domElement.style.top = 0;
        three.renderer.domElement.style.zIndex = -1;

        /* scene */
        three.scene = new THREE.Scene();

        /* camera*/
        three.camera = new THREE.PerspectiveCamera(
                90, window.innerWidth / window.innerHeight, 1, 10000);
        three.camera.position.set(0, 0, 800);
        three.camera.lookAt(three.scene.position );

        /* right */
        three.light = new THREE.PointLight();
        three.light.position.set( -100, 200, 500 );
        three.light.lookAt(three.scene.position);

        three.scene.add(three.light);
        
        three.group = new THREE.Object3D();

        three.group.position.y = 90;

        three.group.rotation.y = 0.2;
        three.group.rotation.x = 0.3;

        three.scene.add(three.group);

        three.domEvents = new THREEx.DomEvents(three.camera, three.renderer.domElement);

        wrapper.append(three.renderer.domElement);
    }

	function addApis (three) {

		three.on = function (eventName, callback) {

			three.event.on(eventName, callback);
		};
	}

	self.init = function (wrapper, styles, options, data) {

		var three = {};

		three.event = $({});
	
		setup(wrapper, three, styles, options, data);
		
		createChart(three);

		render(three);

		bindEvents(wrapper, three);
	
		addApis(three);

		return three;
	};

    if (!window.yisub) {

        window.yisub = {};
    }

    if (!window.yisub.three) {

        window.yisub.three = self;
    }

})();

