	


	/*
		Matrix defines a matrix object which consisters of an Array of Arrays.  
		It can be used to create rotational and translation matricies along with performing matrix multiplication, transposes and dot products.
	*/

	function Matrix (data) {
		this.dim = 2;
		if ( data == null ) this.data = [[]];
		else this.data = data;
	}

	Matrix.prototype.getDimensions = function() {
		return [ this.data.length, this.data[0].length ]; 
	}
	
	Matrix.prototype.getMinMax = function() {

		min = 9999999999;
		max = -999999999;
		for ( var i = 0; i < this.data.length; i++ ) {
			for ( var t = 0; t < this.data[0].length; t++ ) {
				if ( this.data[i][t] < min ) min = this.data[i][t]; 
				if ( this.data[i][t] > max ) max = this.data[i][t]; 
			}
		}
		return [min, max]; 
	};

	Matrix.prototype.createTranslationMatrix = function (x, y, z) {
  		this.data = [[1, 0, 0, x], [0, 1, 0, y], [0, 0, 1, z], [0,0,0,1] ];
	};
	
	Matrix.prototype.createIdentityMatrix = function () {
		this.createTranslationMatrix( 0, 0, 0 ); 
	};
	
	Matrix.prototype.transpose = function () {

		var resultMatrix = new Matrix([]); 
		for ( var i=0; i < this.data.length; i++) {
			resultMatrix.data.push ( [] ); 
			for ( var t=0; t < this.data[0].length; t++){
				resultMatrix.data[i][t] = this.data[t][i]; 
			}
		}
		
		return resultMatrix; 
	}
	
	Matrix.prototype.dotp = function ( a, b ) {
		var result = 0;
		for (var i = 0; i < a.length; i++) {
			result += a[i] * b[i];
		}
		return result;
	}
	
	Matrix.prototype.multTransforms = function ( transMatrixOne, transMatrixTwo ) { 

		resultMatrix = new Matrix ( [ [0,0,0],[0,0,0],[0,0,0] ] );
	
		for ( var i=0; i < transMatrixOne.data.length; i++) {
			for ( var t=0; t < transMatrixTwo.data.length; t++) {
				resultMatrix.data[i][t] = this.dotp ( transMatrixOne.data[i], transMatrixTwo.data[t] ); 
			}
		}
		
		return resultMatrix;
	}

	Matrix.prototype.createScalingMatrix = function ( scale ) {
		this.createIdentityMatrix();
		for ( var i=0; i < this.data.length; i++ ) {
			for ( var t=0; t < this.data[0].length; t++ ) {
				this.data[i][t] = this.data[i][t] * scale; 
			}
		}
	}
	
	Matrix.prototype.createRotationalMatrix = function ( rotateAngle ) { // rotateAngle = [ xDegrees, yDegrees, zDegrees ]

		// convert angles to radians
		var xAngle = rotateAngle[0] * Math.PI / 180;
		var yAngle = rotateAngle[1] * Math.PI / 180;
		var zAngle = rotateAngle[2] * Math.PI / 180;

		// These three matrixes can be transformed into one matrix to reduce multiplications
		var xTranslationMatrix = new Matrix ( [ [ 1, 0, 0], [ 0, Math.cos(xAngle), -Math.sin(xAngle)], [ 0, Math.sin(xAngle), Math.cos(xAngle)] ] ); 
		var yTranslationMatrix = new Matrix ( [ [ Math.cos(yAngle), 0, Math.sin(yAngle)], [ 0, 1, 0], [ -Math.sin(yAngle), 0, Math.cos(yAngle) ] ] );
		var zTranslationMatrix = new Matrix ( [ [ Math.cos(zAngle), -Math.sin(zAngle), 0], [ Math.sin(zAngle), Math.cos(zAngle), 0], [ 0, 0, 1] ] );
	
		var resultTransMatrix = this.multTransforms( xTranslationMatrix, zTranslationMatrix ); 
		var resultTransMatrix = this.multTransforms( resultTransMatrix,  yTranslationMatrix ); 
		this.data = resultTransMatrix.data; 
	}	
	
	Matrix.prototype.print = function () {
		returnStr = "\n"
		for ( var i = 0; i < this.data.length; i++ ) {
			for ( var t = 0; t < this.data[0].length; t++ ) {
				returnStr += this.data[i][t] + " "; 
			}
			returnStr += "\n";
		}
		return returnStr; 
	};


	function testMatrix () {

		a = new Matrix( [ [0,1,2], [3,4,5], [6,7,8] ] );
		aDims = a.getDimensions(); 
		aMinMax = a.getMinMax(); 
		//console.log( 'a:' + a.print() );
		
		rotationalMatrix = new Matrix();
		rotationalMatrix.createRotationalMatrix ( [0,0,45] );  
		rotationalMatrixDims = rotationalMatrix.getDimensions(); 
		rotationalMatrixMinMax = rotationalMatrix.getMinMax(); 
		console.log( 'rotationalMatrix:' + rotationalMatrix.print() );
	}





	/*
		A Point represents a point in a 3 dimentional space.  It is represented as an array of length three corresponding to the x, y, and z cordinate of the point. 
	*/

	Point.prototype = new Matrix()

	function Point( data ) {
		Matrix.call(this, data );
	}
	
	Point.prototype.transformPoint = function( translationMatrix ) {
		var resultPoint = new Point( [ 0, 0, 0 ] ); // 3 x 1  describes a point 
		var trans = translationMatrix.transpose(); 
		for ( var i=0; i < this.data.length; i++ ) resultPoint.data[i] = this.dotp ( this.data, trans.data[i] ); 
		return resultPoint; 
	}
	
	Point.prototype.normalizePoint = function( min, max, xRange, yRange ) {
		var resultPoint = new Point( [ this.data[0] / xRange, this.data[1] / yRange, ( this.data[2]-min ) / ( max - min ) ] ); 
		return resultPoint; 
	}
	
	Point.prototype.print = function () {
		return "x:" + this.data[0] + " y:" + this.data[1] + " z:" + this.data[2];
	};


	function testPoint() {

		var rotationalMatrix = new Matrix();
		rotationalMatrix.createRotationalMatrix ( [0,0,45] );  
		rotationalMatrixDims = rotationalMatrix.getDimensions(); 
		rotationalMatrixMinMax = rotationalMatrix.getMinMax(); 
		console.log( 'rotationalMatrix:' + rotationalMatrix.print() );

		var point = new Point ( [1,1,1] );
		console.log ( "Point:" + point.print() ); 

		var transformedPoint = point.transformPoint ( rotationalMatrix ); 
		console.log ( "Transformed Point:" + transformedPoint.print() ); 
	}






	/*
		This Points class represents a set of points.  This is used as a collection to easily modify points by transforming and copying.
	*/
	
	Points.prototype = new Array;

	function Points() {
		Array.call(this);	
	}	
	
	Points.prototype.normalizePoints = function( max, xRange, yRange ) { 
		var normalizedPoints = new Points();
		for ( var p=0; p < this.length; p++ ) normalizedPoints.push( this[p].normalizePoint( 0, max, xRange, yRange ) ); 
		return normalizedPoints; 
	}
	
	Points.prototype.transformPoints = function ( transform ) {
		var transformedPoints = new Points();
		for ( var p=0; p < this.length; p++ ) transformedPoints.push( this[p].transformPoint( transform ) ); 
		return transformedPoints; 
	}

	Points.prototype.copy = function () {
		var copyPoints = new Points();
		for ( var i=0; i < this.length; i++ ) {
			copyPoints.push ( new Point ( [ this[i].data[0], this[i].data[1], this[i].data[2] ] ) );
		}
		return copyPoints; 
	}

	



	/*
		This Points class represents a set of points.  This is used as a collection to easily modify points by transforming and copying.
	*/
	
	Points.prototype = new Array;

	function Points() {
		Array.call(this);	
	}	
	
	Points.prototype.normalizePoints = function( max, xRange, yRange ) { 
		var normalizedPoints = new Points();
		for ( var p=0; p < this.length; p++ ) normalizedPoints.push( this[p].normalizePoint( 0, max, xRange, yRange ) ); 
		return normalizedPoints; 
	}
	
	Points.prototype.transformPoints = function ( transform ) {
		var transformedPoints = new Points();
		for ( var p=0; p < this.length; p++ ) transformedPoints.push( this[p].transformPoint( transform ) ); 
		return transformedPoints; 
	}

	Points.prototype.copy = function () {
		var copyPoints = new Points();
		for ( var i=0; i < this.length; i++ ) {
			copyPoints.push ( new Point ( [ this[i].data[0], this[i].data[1], this[i].data[2] ] ) );
		}
		return copyPoints; 
	}

	


	/*
		The Axis class represents a 3 dimensional axis.  It consists of points of the axis along with lines connectingt his points. 
	*/

	function Axis() {

		this.points = new Points();
		this.transformedPoints = new Points(); 
		this.lines = [];

		// Create Access Points
		this.points.push ( new Point ( [ 2,0,0] ) ); 
		this.points.push ( new Point ( [ -2,0,0] ) ); 
		this.points.push ( new Point ( [ 0,2,0] ) ); 
		this.points.push ( new Point ( [ 0,-2,0] ) ); 
		this.points.push ( new Point ( [ 0,0,2] ) ); 
		this.points.push ( new Point ( [ 0,0,-2] ) ); 
						
		// Create Access Lines 
		this.lines.push ( [0,1] ); 
		this.lines.push ( [2,3] ); 
		this.lines.push ( [4,5] ); 
	}
	



	/*
		A Surface represents a 3 dimensional plane.  It is made up of a collection of points, lines connecting this points, and planes which connect adjacent points. 
	*/

	function Surface() {
		
		_self = this; // need a self reference for any event callbacks
		this.points = new Points();	
		this.normalizedPoints = new Points(); 
		this.transformedPoints = new Points(); 
		this.lines = [];	
		this.planes = [];

		this.min = 9999999999;
		this.max = -999999999;
		
		this.xStart = null;
		this.yStart = null;
		this.xRange = null; 
		this.yRange = null; 
		this.surfaceFunc = null; 
	}
		
	
	Surface.prototype.createSurfaceFuncFromString = function ( funcStr ) { 
		funcStr = funcStr.replace(/cos/g,"Math.cos");
		funcStr = funcStr.replace(/sin/g,"Math.sin");
		console.log("SurfaceFunc:" + funcStr );
		this.funcStr = funcStr;

	}
	
	Surface.prototype.surfaceFuncEval= function ( x, y) {
		currentfuncStr = this.funcStr; 
		currentfuncStr = currentfuncStr.replace("x",x);
		currentfuncStr = currentfuncStr.replace("y",y);
		try {
			return eval( currentfuncStr );
		} catch (e) {
			console.log("SurfaceFunc Validation Failed funcStr:" + this.funcStr );
		}
	}
	
	Surface.prototype.createSurfaceFromFunc = function ( xRange, yRange, xStart, yStart, func ) {

		this.xStart = xStart;
		this.yStart = yStart;
		this.xRange = xRange; 
		this.yRange = yRange; 
		this.xFinish = xStart + xRange;
		this.yFinish = yStart + yRange;
		this.surfaceFunc = func; 

		this.createPointsForGridData(); 
		this.createLinesForGridData(); 
		this.createPlanesForGridData(); 
	}
	
	Surface.prototype.createPointsForGridData = function () {
		var count = 0 ;
		for ( var i = this.xStart; i < this.xFinish; i++ ) {
			for ( var t = this.yStart; t < this.yFinish; t++ ) {
				var value = this.surfaceFunc ( i, t); 
				this.points.push( new Point ( [ i, t, value ] ) );
				if ( value < this.min ) this.min = value; 
				if ( value > this.max ) this.max = value; 
				count += 1; 
			}
		}
	}	

	Surface.prototype.createLinesForGridData = function () {
		this.lines = [];
		var count = 0; 
		for ( var i = this.xStart; i < this.xFinish; i++ ) {
			for ( var t = this.yStart; t < this.yFinish; t++ ) {

				if ( t < this.yFinish - 1 ) {
					this.lines.push ( [ count, count + 1 ] ); 
					if ( i < this.xFinish - 1) {
						this.lines.push ( [ count, count + this.xRange ] );
					}	
				} else if ( t == this.yFinish -1 ) {
					if ( i < this.xFinish - 1) {
						this.lines.push ( [ count, count + this.xRange ] ); // Ignor the next item due to flipping to the next row
					}
				}

				count += 1; 
			}
		}
	}

	Surface.prototype.createPlanesForGridData = function () {
		this.planes = [];
		var count = 0; 
		for ( var i = this.xStart; i < this.xFinish; i++ ) {
			for ( var t = this.yStart; t < this.yFinish; t++ ) {
				if ( t < this.yFinish - 1  && i < this.xFinish -1 ) {
					this.planes.push( [ count, count + 1, count + this.xRange, count + this.xRange + 1 ] )
				}
				count += 1; 
			}
		}
	}




	/*
		The Dragging Rotation Object connects to events that are processed on the browser and enable rotation and redrawing of a surface. 
		This is used to allow clicking and dragging to rotate a surface on the canvas. 
	*/

	function DraggingRotation() {
		this.startX = null;
		this.startY = null;
		_DraggingRotationSelf= this; // We need to bind a reference to this such that the event handlers can access the this current object during callbacks 
	}
	
	DraggingRotation.prototype.getOnClickAngle = function ( offsetX, offsetY ) {
		xAngle = 360 * offsetY / 2000; 
		yAngle = 360 * offsetX / 2000; 
		zAngle = 0; 
		return [ xAngle, yAngle, zAngle ];
	}
	
	DraggingRotation.prototype.onMouseDown = function ( event ) {
		_DraggingRotationSelf.startX = event.offsetX; 
		_DraggingRotationSelf.startY = event.offsetY;
	} 
	
	DraggingRotation.prototype.onMouseUp= function ( event ) {
		_DraggingRotationSelf.startX = null; 
		_DraggingRotationSelf.startY = null; 
	} 
	
	DraggingRotation.prototype.onMouseMovement = function ( event ) {
		if ( _DraggingRotationSelf.startX == null ) return; // no clicked 

		xDelta = event.offsetX - _DraggingRotationSelf.startX;
		yDelta = event.offsetY - _DraggingRotationSelf.startY; 
		var rotateAngle = _DraggingRotationSelf.getOnClickAngle ( xDelta, yDelta ); 
		
		_DraggingRotationSelf.startX = event.offsetX; 
		_DraggingRotationSelf.startY = event.offsetY;
		
		var rotationalMatrix = new Matrix();
		rotationalMatrix.createRotationalMatrix ( rotateAngle );
		
		surface.transformedPoints = surface.transformedPoints.transformPoints ( rotationalMatrix ); 
		axis.transformedPoints = axis.transformedPoints.transformPoints ( rotationalMatrix ); 

		writeGridDataToCanvasFive( axis, surface ); 
	} 


