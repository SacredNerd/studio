"""Vector icon drawings for the Funky template in ReportLab."""

from reportlab.graphics.shapes import Drawing, Group, Path, Circle, Rect, Polygon
from reportlab.lib.colors import Color

def flip(y):
    return 24 - y

def create_icon(name: str, color: Color, size: int = 14) -> Drawing:
    d = Drawing(size, size)
    g = Group()
    scale = size / 24.0
    g.scale(scale, scale)
    
    # Use fill, no stroke
    strokeColor = None
    strokeWidth = 0
    fillColor = color

    if name == 'mail':
        g.add(Rect(2, flip(4)-16, 20, 16, rx=2, ry=2, strokeColor=strokeColor, strokeWidth=strokeWidth, fillColor=fillColor))
    elif name == 'phone':
        g.add(Rect(5, flip(2)-20, 14, 20, rx=3, ry=3, strokeColor=strokeColor, strokeWidth=strokeWidth, fillColor=fillColor))
    elif name == 'mappin':
        g.add(Circle(12, flip(9), 7, strokeColor=strokeColor, strokeWidth=strokeWidth, fillColor=fillColor))
        points = [5, flip(9), 12, flip(22), 19, flip(9)]
        g.add(Polygon(points, strokeColor=strokeColor, strokeWidth=strokeWidth, fillColor=fillColor))
    elif name == 'user':
        g.add(Circle(12, flip(7), 4, strokeColor=strokeColor, strokeWidth=strokeWidth, fillColor=fillColor))
        points = [4, flip(21), 4, flip(17), 7, flip(14), 17, flip(14), 20, flip(17), 20, flip(21)]
        g.add(Polygon(points, strokeColor=strokeColor, strokeWidth=strokeWidth, fillColor=fillColor))
    elif name == 'briefcase':
        g.add(Rect(2, flip(7)-14, 20, 14, rx=2, ry=2, strokeColor=strokeColor, strokeWidth=strokeWidth, fillColor=fillColor))
        g.add(Rect(8, flip(3)-4, 8, 4, rx=1, ry=1, strokeColor=strokeColor, strokeWidth=strokeWidth, fillColor=fillColor))
    elif name == 'graduationcap':
        points = [2, flip(8), 12, flip(3), 22, flip(8), 12, flip(13)]
        g.add(Polygon(points, strokeColor=strokeColor, strokeWidth=strokeWidth, fillColor=fillColor))
        points2 = [6, flip(11), 6, flip(18), 12, flip(21), 18, flip(18), 18, flip(11)]
        g.add(Polygon(points2, strokeColor=strokeColor, strokeWidth=strokeWidth, fillColor=fillColor))
    elif name == 'star':
        points = [12, flip(2), 15, flip(9), 22, flip(9), 17, flip(14), 19, flip(21), 12, flip(17), 5, flip(21), 7, flip(14), 2, flip(9), 9, flip(9)]
        g.add(Polygon(points, strokeColor=strokeColor, strokeWidth=strokeWidth, fillColor=fillColor))
    elif name == 'award':
        g.add(Circle(12, flip(7), 5, strokeColor=strokeColor, strokeWidth=strokeWidth, fillColor=fillColor))
        points = [8, flip(22), 12, flip(20), 16, flip(22), 14, flip(10), 10, flip(10)]
        g.add(Polygon(points, strokeColor=strokeColor, strokeWidth=strokeWidth, fillColor=fillColor))
    elif name == 'folder':
        g.add(Rect(2, flip(6)-14, 20, 14, rx=2, ry=2, strokeColor=strokeColor, strokeWidth=strokeWidth, fillColor=fillColor))
    elif name == 'zap':
        points = [13, flip(2), 3, flip(14), 12, flip(14), 11, flip(22), 21, flip(10), 12, flip(10)]
        g.add(Polygon(points, strokeColor=strokeColor, strokeWidth=strokeWidth, fillColor=fillColor))
    elif name == 'globe':
        g.add(Circle(12, flip(12), 10, strokeColor=strokeColor, strokeWidth=strokeWidth, fillColor=fillColor))
    elif name == 'palette':
        g.add(Circle(12, flip(12), 10, strokeColor=strokeColor, strokeWidth=strokeWidth, fillColor=fillColor))
    elif name == 'users':
        g.add(Circle(8, flip(8), 3, strokeColor=strokeColor, strokeWidth=strokeWidth, fillColor=fillColor))
        g.add(Circle(16, flip(8), 3, strokeColor=strokeColor, strokeWidth=strokeWidth, fillColor=fillColor))
        points1 = [3, flip(20), 3, flip(17), 5, flip(14), 11, flip(14), 13, flip(17), 13, flip(20)]
        g.add(Polygon(points1, strokeColor=strokeColor, strokeWidth=strokeWidth, fillColor=fillColor))
        points2 = [11, flip(20), 11, flip(17), 13, flip(14), 19, flip(14), 21, flip(17), 21, flip(20)]
        g.add(Polygon(points2, strokeColor=strokeColor, strokeWidth=strokeWidth, fillColor=fillColor))
    elif name == 'link':
        g.add(Rect(4, flip(8)-8, 16, 8, rx=4, ry=4, strokeColor=strokeColor, strokeWidth=strokeWidth, fillColor=fillColor))
    elif name == 'book':
        g.add(Rect(4, flip(4)-16, 16, 16, rx=2, ry=2, strokeColor=strokeColor, strokeWidth=strokeWidth, fillColor=fillColor))
    elif name == 'heart':
        points = [12, flip(21), 5, flip(14), 5, flip(8), 8, flip(5), 12, flip(8), 16, flip(5), 19, flip(8), 19, flip(14)]
        g.add(Polygon(points, strokeColor=strokeColor, strokeWidth=strokeWidth, fillColor=fillColor))
    elif name == 'pluscircle':
        g.add(Circle(12, flip(12), 10, strokeColor=strokeColor, strokeWidth=strokeWidth, fillColor=fillColor))
    else:
        # Default rect block
        g.add(Rect(4, flip(4)-16, 16, 16, strokeColor=strokeColor, strokeWidth=strokeWidth, fillColor=fillColor))

    d.add(g)
    return d
