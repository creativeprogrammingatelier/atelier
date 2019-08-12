class Circle {
  
  int posx, posy, radius;
  PVector loc;
  
  public Circle(int x, int y, int r) {
    posx = x;
    posy = y;
    radius = r;
    loc = new PVector(x, y);
    
    println("Created circle at" + x + "," + y);
  }
  
  void display() {
   ellipse(posx, posy, radius, radius); 
  }
  
  boolean renderedOnTop(Circle other) {
    float distance = loc.dist(other.loc);
    if (distance < radius) {
     return true; 
    } else {
     return false; 
    }
  }
  
  boolean overlapping(Circle other){
   //println("Check for overlap");
   float distance = loc.dist(other.loc);
   if (distance < radius + other.radius) {
     println("There is overlap!");
    return true; 
   }
   //println("There is no overlap");
   return false;
  }
  
  
  
}
