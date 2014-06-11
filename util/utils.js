/**
 * Description : parse color and return rgb value
 * @method parseColor
 *   @param: color(string)  contains 'r,g,b' values
 *   @return: r,g,b(number)    returns {r, g, b} numbers
 */
function parseColor(color) {
    var rgb = color.split('('), colorParts = rgb[1].split(','), r, g, b;
    r = parseInt(colorParts[0], 10);
    g = parseInt(colorParts[1], 10);
    b = parseInt(colorParts[2], 10);
    return ({r:r,g:g,b:b});
}