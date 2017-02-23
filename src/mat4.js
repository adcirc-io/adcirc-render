function mat4 () {

    var mat = new Float32Array( 16 ).fill( 0 );
    mat[0] = mat[5] = mat[10] = mat[15] = 1;

    mat.orthographic_projection = function ( width, height ) {

        var left = -width/2;
        var right = width/2;
        var top = -height/2;
        var bottom = height/2;
        var sx = 2/(right-left);
        var sy = 2/(top-bottom);
        var tx = -(right+left)/(right-left);
        var ty = -(top+bottom)/(top-bottom);

        mat[0] = sx;  mat[4] =  0;  mat[8]  = 0;  mat[12] = tx;
        mat[1] =  0;  mat[5] = sy;  mat[9]  = 0;  mat[13] = ty;
        mat[2] =  0;  mat[6] =  0;  mat[10] = 1;  mat[14] =  0;
        mat[3] =  0;  mat[7] =  0;  mat[11] = 0;  mat[15] =  1;

        return mat;

    };

    mat.scale = function ( scale ) {

        mat[0] = scale;
        mat[5] = scale;

        return mat;

    };

    mat.translate = function ( tx, ty ) {

        mat[12] = tx;
        mat[13] = ty;

        return mat;

    };

    return mat;

}

export { mat4 };