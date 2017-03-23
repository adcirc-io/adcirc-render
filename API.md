# adcirc-render API

The adcirc-render library consists of three main types. First a renderer, which knows how to communicate with the browser in order to draw things on the screen. Second, geometries, which describe *what* to draw. And third, shaders, which describe *how* to draw.

## Renderer

<a name="adcirc-gl-renderer" href="#adcirc-gl-renderer">#</a> *adcirc*.**gl_renderer**(*selection*)

Creates a new WebGL renderer. The *selection* parameter must be an HTML canvas element selected using d3.select(). Returns the new renderer object if WebGL is available, otherwise returns undefined.

<a name="renderer-add-view" href="#renderer-add-view">#</a> *gl_renderer*.**add_view**(*view*)

Adds the <a href="adcirc-view">view</a> to the renderer. The view is rendered each time the renderer updates. The renderer updates the projection matrix of the view's active shader in response to user interaction.

<a name="renderer-clear-color" href="#renderer-clear-color">#</a> *gl_renderer*.**clear_color**([*specifier*])

Gets or sets the background color of the rendering area. If getting, the color is returned as a d3.rgb(). The color can be set by passing in a color specifier, parsing as defined by <a href="https://github.com/d3/d3-color#rgb">d3.**rgb**()</a>.

<a name="renderer-gl-context" href="#renderer-gl-context">#</a> *gl_renderer*.**gl_context**()

Returns the WebGL rendering context.

<a name="renderer-remove-view" href="#renderer-remove-view">#</a> *gl_renderer*.**remove_view**(*view*)

Removes the <a href="adcirc-view">view</a> from the renderer. The view will no longer be rendered when the renderer updates.

<a name="renderer-render" href="#renderer-render">#</a> *gl_renderer*.**render**()

Requests that the renderer redraw all views. Note that this is a deferred render, and the actual rendering will happen when the next animation frame is available.

<a name="renderer-zoom-to" href="#renderer-zoom-to">#</a> *gl_renderer*.**zoom_to**(*geometry*)

Tranlates and zooms the renderer view to the bounding box of *geometry*.

## Geometry

Geometries are used by adcirc-render to bridge the gap between how meshes are represented from the perspective of an ADCIRC modeler and how WebGL needs to organize and view data in order for it to be rendered properly.

<a name="adcirc-geometry" href="#adcirc-geometry">#</a> *adcirc*.**geometry**(*gl*, *mesh*[, *indexed*])

Creates a new geometry. *gl* is a WebGL rendering context, *mesh* is a <a href="#adcirc-mesh">mesh</a>, and optionally, indexed is a boolean describing if the data buffers should use indexed rendering (default is false).

<a name="geometry-bind-buffer" href="#geometry-bind-buffer">#</a> *geometry*.**bind_buffer**(*attribute*)

Binds the requested *attribute*, if it is available, and returns the bound buffer. Returns undefined if the *attribute* is not available.

The returned buffer is an object containing the following:

* buffer
* size
* type
* normalized
* stride
* offset

See [vertexAttribPointer](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer) documentation for description of each field. The buffer field is the WebGL array buffer.

<a name="geometry-bounding-box" href="#geometry-bounding-box">#</a> *geometry*.**bounding_box**()

Returns the bounding box of the mesh that the geometry is responsible for rendering.

<a name="geometry-draw-arrays" href="#geometry-draw-arrays">#</a> *geometry*.**draw_arrays**()

Performs rendering of the entire mesh. Simply calls [drawArrays](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawArrays) with the appropriate parameters.

_**Note to self: this is where I should implement rendering of portions of meshes. WebGL drawArrays accepts a start index and count, so this function could take a list of [start, count, start, count, ...] to allow for drawing subsets**_

<a name="geometry-elemental-value" href="#geometry-elemental-value">#</a> *geometry*.**elemental_value**(*value*)

If the mesh contains the elemental value *value*, fills the vertex value buffer with the data associated with that value.

<a name="geometry-nodal-value" href="#geometry-nodal-value">#</a> *geometry*.**nodal_value**(*value*)

If the mesh contains the nodal value *value*, fills the vertex value buffer with the data associated with that value.

## Shaders

Shaders are used by adcirc-render to describe how a <a href="#adcirc-geometry">geometry</a> should be rendered.

## View

<a name="view-elemental-value" href="#view-elemental-value">#</a> *view*.**elemental_value**(*value*)

Instructs the geometry associated with this view to use the data associated with the elemental value *value*.

<a name="view-nodal-value" href="#view-nodal-value">#</a> *view*.**nodal_value**(*value*)

Instructs the geometry associated with this view to use the data associated with the nodal value *value*.

<a name="view-render" href="#view-render">#</a> *view*.**render**()

Renders the view.

<a name="view-shader" href="#view-shader">#</a> *view*.**shader**()

Returns the shader currently being used by the view.