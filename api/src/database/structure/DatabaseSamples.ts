import {pool, end, permissionBits, pgDB} from '../HelperDB'
import { isPostgresError } from '../../helpers/DatabaseErrorHelper';


/**
 * most exported functions in this file, contain the query string for some view of the database
 * By calling these functions, the respective query can be inserted into some string at the callee's end.
 * parameters given to these functions replace tables `FROM` which data is pulled.
 * this can be used to allow the data from an insert or update to be utilized in the respective view
 * All these queries have a `WHERE` clause specified, so to add more checks can be done by appending `AND <condition>`
 * but is generally not best practice, as it requires to know what names are used in the query.
 *
 */

export function databaseSamples(client : pgDB = pool) : Promise<void> {
	const query = `
	
	INSERT INTO "Courses" VALUES 
		('00000000-0000-0000-0000-000000000001', 'Art, Impact and Technology', DEFAULT, (SELECT userID from "Users" LIMIT 1));
	
	
	INSERT INTO "CourseRegistration" VALUES
	    ('00000000-0000-0000-0000-000000000001', (SELECT userID from "Users" WHERE samlID='samling_user'), 'student', 0::bit(${permissionBits})),
	    ('00000000-0000-0000-0000-000000000001', (SELECT userID from "Users" WHERE samlID='samling_teacher'), 'teacher', 0::bit(${permissionBits})),
	    ('00000000-0000-0000-0000-000000000001', (SELECT userID from "Users" WHERE samlID='samling_TA'), 'TA', 0::bit(${permissionBits})),
	    ('00000000-0000-0000-0000-000000000001', (SELECT userID from "Users" WHERE globalRole='plugin'), 'plugin', 0::bit(${permissionBits}));
	    
	INSERT INTO "Submissions" VALUES
		('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', (SELECT userID from "Users" WHERE samlID='samling_user'), 'Planets', DEFAULT, DEFAULT);
		
	INSERT INTO "Files" VALUES
	     ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'uploads/4159c5396e18328f30afc1dd0edcf2e7/Planets/Perlin.pde', 'processing'),
	     ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'uploads/4159c5396e18328f30afc1dd0edcf2e7/Planets/Planets.pde', 'processing'),
	     ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'uploads/4159c5396e18328f30afc1dd0edcf2e7/Planets/data/mercury', 'image/jpg'),
	     ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'uploads/4159c5396e18328f30afc1dd0edcf2e7/Planets/data/planet', 'image/jpg'),
	     ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'uploads/4159c5396e18328f30afc1dd0edcf2e7/Planets/data/starfield', 'image/jpg'),
	     ('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'uploads/4159c5396e18328f30afc1dd0edcf2e7/Planets/data/sun', 'image/jpg');
	     
	INSERT INTO "Snippets" VALUES
	     ('00000000-0000-0000-0000-000000000001', 
	          29, 58, 2, 4, 
	          '/*
  // The clouds texture will "move" having the values of its u
  // texture coordinates displaced by adding a constant increment
  // in each frame. This requires REPEAT wrapping mode so texture 
  // coordinates can be larger than 1.
  //PTexture.Parameters params2 = PTexture.newParameters();
  //params2.wrapU = REPEAT;
  cloudtex = createImage(512, 256);

  // Using 3D Perlin noise to generate a clouds texture that is seamless on
  // its edges so it can be applied on a sphere.
  cloudtex.loadPixels();
  Perlin perlin = new Perlin();
  for (int j = 0; j < cloudtex.height; j++) {
    for (int i = 0; i < cloudtex.width; i++) {
      // The angle values corresponding to each u,v pair:
      float u = float(i) / cloudtex.width;
      float v = float(j) / cloudtex.height;
      float phi = map(u, 0, 1, TWO_PI, 0); 
      float theta = map(v, 0, 1, -HALF_PI, HALF_PI);
      // The x, y, z point corresponding to these angles:
      float x = cos(phi) * cos(theta);
      float y = sin(theta);            
      float z = sin(phi) * cos(theta);      
      float n = perlin.noise3D(x, y, z, 1.2, 2, 8);
      cloudtex.pixels[j * cloudtex.width + i] = color(255, 255,  255, 255 * n * n);
    }
  }  
  cloudtex.updatePixels();
  */'
	     ),
	     ('00000000-0000-0000-0000-000000000002', 
	          57, 57, 2, 10, 
	          'cloudtex'
	     ),
	     ('00000000-0000-0000-0000-000000000003', 
	          178, 204, 4, 23, 
	          'q = g3[b00 + bz0]; 
    u = at3(q, rx0, ry0, rz0);
    q = g3[b10 + bz0]; 
    v = at3(q, rx1, ry0, rz0);
    a = lerp(u, v, t);

    q = g3[b01 + bz0]; 
    u = at3(q, rx0, ry1, rz0);
    q = g3[b11 + bz0]; 
    v = at3(q, rx1, ry1, rz0);
    b = lerp(u, v, t);

    c = lerp(a, b, sy);

    q = g3[b00 + bz1]; 
    u = at3(q, rx0, ry0, rz1);
    q = g3[b10 + bz1]; 
    v = at3(q, rx1, ry0, rz1);
    a = lerp(u, v, t);

    q = g3[b01 + bz1]; 
    u = at3(q, rx0, ry1, rz1);
    q = g3[b11 + bz1]; 
    v = at3(q, rx1, ry1, rz1);
    b = lerp(u, v, t);

    d = lerp(a, b, sy);'
	     ),
     ( -- a null snippet
          '00000000-0000-0000-0000-000000000004',
          -1, -1, -1, -1,
          ''
     );
	     
	INSERT INTO "CommentThread" VALUES
		('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', DEFAULT),
		('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', DEFAULT),
		('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', DEFAULT),
		('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', (SELECT fileid FROM "Files" WHERE submissionid='00000000-0000-0000-0000-000000000001' AND type='undefined/undefined'), '00000000-0000-0000-0000-000000000004', DEFAULT);
	
	INSERT INTO "Comments" VALUES
		('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', (SELECT userID from "Users" WHERE samlID='samling_TA'), DEFAULT, 'Hint, you know comments are there to do absolutely nothing...'),
		('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', (SELECT userID from "Users" WHERE samlID='samling_TA'), DEFAULT, 'Bad names'),
		('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', (SELECT userID from "Users" WHERE samlID='samling_TA'), DEFAULT, 'All these names are totally incomprehensible to anyone, horrible to do this!'),
		('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', (SELECT userID from "Users" WHERE samlID='samling_teacher'), DEFAULT, 'Youre missing some planets, Pluto example');
	
     `
     return client.query(query).then(() => {
          console.log("inserted values into db")
     }).catch(e=>{
          if (isPostgresError(e) && e.position!==undefined){
			console.log(query.substring(Number(e.position)-20, Number(e.position)+20))
		}
		throw e
     });
}
// pool.query("SELECT * from Users").then(res => console.log(res, res.rows, res.rows[0])).then(pool.end())
if (require.main === module){
	databaseSamples().then(end)
} else {
	// makeDB(()=>{console.log("made the database")}, console.error)
}