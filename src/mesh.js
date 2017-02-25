function mesh () {

    var _nodes;
    var _elements;

    var _nodal_values;

    var _bounding_box;

    function _mesh () {}

    _mesh.bounding_box = function () {
        return _bounding_box;
    };

    _mesh.elements = function (_) {
        if ( !arguments.length ) return _elements;
        _elements = _;
        return _mesh;
    };

    _mesh.nodes = function (_) {
        if ( !arguments.length ) return _nodes;
        _nodes = _;
        _bounding_box = calculate_bbox( _mesh );
        return _mesh;
    };

    _mesh.nodal_values = function (_) {
        if ( !arguments.length ) return _nodal_values;
        _nodal_values = _;
        return _mesh;
    };

    _mesh.num_elements = function () {
        return _elements ? _elements.length : 0;
    };

    _mesh.num_nodes = function () {
        return _nodes ? _nodes.length : 0;
    };

    return _mesh;

}

function calculate_bbox ( mesh ) {

    var nodes = mesh.nodes();
    var numnodes = nodes.length/3;
    var minx = Infinity, maxx = -Infinity;
    var miny = Infinity, maxy = -Infinity;
    var minz = Infinity, maxz = -Infinity;
    for ( var i=0; i<numnodes; ++i ) {
        if ( nodes[3*i] < minx ) minx = nodes[3*i];
        else if ( nodes[3*i] > maxx ) maxx = nodes[3*i];
        if ( nodes[3*i+1] < miny ) miny = nodes[3*i+1];
        else if ( nodes[3*i+1] > maxy ) maxy = nodes[3*i+1];
        if ( nodes[3*i+2] < minz ) minz = nodes[3*i+2];
        else if ( nodes[3*i+2] > maxz ) maxz = nodes[3*i+2];
    }
    return [[minx, maxx], [miny, maxy], [minz, maxz]];

}

export { mesh }