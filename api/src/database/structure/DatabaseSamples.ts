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
const uuid = "'00000000-0000-0000-0000-000000000000'"

export function databaseSamples(client : pgDB = pool) : Promise<void> {
     const query = `
     INSERT INTO "Users" VALUES
          (DEFAULT, NULL, 'normal', 'Cas@Caaas', 'admin', 0::bit(${permissionBits}), '$2b$10$/AP8x6x1K3r.bWVZR8B.l.LmySZwKqoUv8WYqcZTzo/w6.CHt7TOu'),
          (${uuid}, 'samling_admin','Cs', 'admin@Cas', 'admin', 0::bit(${permissionBits}), ''),
          (DEFAULT, 'samling_user','Cas', 'user@Cas', 'user', 0::bit(${permissionBits}), ''),
          (DEFAULT, 'samling_teacher','Caas', 'teacher@Cas', 'user', 0::bit(${permissionBits}), ''),
          (DEFAULT, 'samling_TA','Caaas', 'TA@Cas', 'user', 0::bit(${permissionBits}), ''),
          (DEFAULT, NULL, 'PMD', 'pmd@plugin', 'plugin', 0::bit(${permissionBits}), ''),
          (DEFAULT, NULL, 'test user', 'test@test', 'user', 0::bit(${permissionBits}), '');

     INSERT INTO "Plugins" VALUES
          ((SELECT userID FROM "Users" WHERE globalRole='plugin' LIMIT 1), 
          'http://localhost:5000/atelier/hook', 
          'Super$ecretWebh00k$ecret', 
          '-----BEGIN RSA PUBLIC KEY-----
          MIICCgKCAgEA1y78vFFBb+bBWmVGqO9KWuHYBf2Xo0iFVoFYCF2XMFy32vXIF26H
          5g0uTIE1p+fza/G58YRQYoCko2HtdC510Enx0+kGj1vvw3p6Kja3s3jv+bzv/6wB
          zQPs+S7fQ7pGRAVyBEp869y1FpuDp4rengBkXz5OI3wZREvD1db4LhKTZNasAe+W
          ilO7ohWlUG4u1T5spGHl+mjrxa7ooaKknfB8FP5Upm0fN58r8q3RfF5h1VcaNlpa
          cFFEMrA7mlx+ZUmyE+YA7AhML1wORNVxDXS9l2ngISaq+7PVmhqDgabI503Sj+gY
          MqlZ/ziIpS7oGCnfY8VF/sOQ/PEntbTjbiCrPy0nDCfUnKjuulBGqmRKO5DX2wAi
          Nq9QYiHqXzU90PzADXrKCeT90cOcwXUiUQSDiNGhROp9LgiX1U5BOae1bRjchcNP
          NDpMbogvgK/yfhTp1+huZbYd+vlp4VWH0BZssVT606u3pwej1lql+Y9JArW8GrRB
          pYd9P4uTlyzcTtHSqP3on74MGsM9sGkMxZNMvFmgDsDEPCoMphlCCYLhUj7oa8EB
          k/EiwCFulZ/0NAAK1rJG+LW5tj4uv68jzFRKDQQjwWpzEa+zT4uTfyDp852eaeAj
          SdfHBttlTZZXgTfHffVPikkBZQueP/sfyUjPXu/QSHCyTv28GPuOH6sCAwEAAQ==
          -----END RSA PUBLIC KEY-----');
     
     INSERT INTO "PluginHooks" VALUES
          ((SELECT pluginID FROM "Plugins" LIMIT 1),
          'submission.file'
          );
	
     INSERT INTO "Courses" VALUES 
          (${uuid}, 'Pearls of Computer Science', DEFAULT, (SELECT userID from "Users" LIMIT 1)),
		('00000000-0000-0000-0000-000000000001', 'Art, Impact and Technology', DEFAULT, (SELECT userID from "Users" LIMIT 1));
	
	
     INSERT INTO "CourseRegistration" VALUES
          ((SELECT courseID from "Courses" LIMIT 1), (SELECT userID from "Users" LIMIT 1), 'student', 3::bit(${permissionBits})),
          (${uuid}, (SELECT userID from "Users" WHERE samlID='samling_user'), 'student', 0::bit(${permissionBits})),
          (${uuid}, (SELECT userID from "Users" WHERE samlID='samling_teacher'), 'teacher', 0::bit(${permissionBits})),
          (${uuid}, (SELECT userID from "Users" WHERE samlID='samling_TA'), 'TA', 0::bit(${permissionBits})),
          (${uuid}, (SELECT userID from "Users" WHERE globalRole='plugin'), 'plugin', 0::bit(${permissionBits})),
	    ('00000000-0000-0000-0000-000000000001', (SELECT userID from "Users" WHERE samlID='samling_user'), 'student', 0::bit(${permissionBits})),
	    ('00000000-0000-0000-0000-000000000001', (SELECT userID from "Users" WHERE samlID='samling_teacher'), 'teacher', 0::bit(${permissionBits})),
	    ('00000000-0000-0000-0000-000000000001', (SELECT userID from "Users" WHERE samlID='samling_TA'), 'TA', 0::bit(${permissionBits})),
	    ('00000000-0000-0000-0000-000000000001', (SELECT userID from "Users" WHERE globalRole='plugin'), 'plugin', 0::bit(${permissionBits}));
	    
     INSERT INTO "Submissions" VALUES
          (${uuid}, ${uuid}, ${uuid}, 'MyFirstSubmission', DEFAULT, DEFAULT),
		('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', (SELECT userID from "Users" WHERE samlID='samling_user'), 'Planets', DEFAULT, DEFAULT);
		
     INSERT INTO "Files" VALUES
	     (${uuid}, (SELECT submissionID from "Submissions" LIMIT 1), 'uploads/00000000-0000-0000-0000-000000000000/MyFirstSubmission/MyFirstSubmission', 'processing'),
	     ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'uploads/4159c5396e18328f30afc1dd0edcf2e7/Planets/Perlin.pde', 'processing'),
	     ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'uploads/4159c5396e18328f30afc1dd0edcf2e7/Planets/Planets.pde', 'processing'),
	     ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'uploads/4159c5396e18328f30afc1dd0edcf2e7/Planets/data/mercury', 'image/jpg'),
	     ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'uploads/4159c5396e18328f30afc1dd0edcf2e7/Planets/data/planet', 'image/jpg'),
	     ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'uploads/4159c5396e18328f30afc1dd0edcf2e7/Planets/data/starfield', 'image/jpg'),
	     ('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'uploads/4159c5396e18328f30afc1dd0edcf2e7/Planets/data/sun', 'image/jpg');
	     
     INSERT INTO "Snippets" VALUES
          (    ${uuid}, 
               0, 1, 0, 0, 
               'this is a snippet of a file',
               'head context',
               'footer context'
          ),
          ( -- a null snippet
               'ffffffff-ffff-ffff-ffff-ffffffffffff',
               -1, -1, -1, -1,
               '','',''
          ),
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
  */','before context works!','after context works too!'
	     ),
	     ('00000000-0000-0000-0000-000000000002', 
	          57, 57, 2, 10, 
               'cloudtex',
               'this is a line before the item, as context',
               'this is a line after the item, as context'
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

    d = lerp(a, b, sy);',
    '',''
	     ),
     ( -- a null snippet
          '00000000-0000-0000-0000-000000000004',
          -1, -1, -1, -1,
          '','',''
     );
	     
     INSERT INTO "CommentThread" VALUES
          (${uuid}, (SELECT submissionID from "Submissions" LIMIT 1), (SELECT fileID from "Files" LIMIT 1), ${uuid}, DEFAULT),
          (DEFAULT, (SELECT submissionID from "Submissions" LIMIT 1), (SELECT fileID from "Files" LIMIT 1), 'ffffffff-ffff-ffff-ffff-ffffffffffff', DEFAULT),
		('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', DEFAULT),
		('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', DEFAULT),
		('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', DEFAULT),
		('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', (SELECT fileid FROM "Files" WHERE submissionid='00000000-0000-0000-0000-000000000001' AND type='undefined/undefined'), '00000000-0000-0000-0000-000000000004', DEFAULT);
	
     INSERT INTO "Comments" VALUES
          (${uuid}, (SELECT commentThreadID from "CommentThread" LIMIT 1), (SELECT userID from "Users" LIMIT 1), DEFAULT, DEFAULT, 'This is comment 0. It has a mention to @Caaas, a TA.'),
          (DEFAULT, (SELECT commentThreadID from "CommentThread" LIMIT 1), (SELECT userID from "Users" LIMIT 1), DEFAULT, DEFAULT, 'This is a multi\\nline comment!'),
          (DEFAULT, (SELECT commentThreadID from "CommentThread" LIMIT 1), (SELECT userID from "Users" LIMIT 1), DEFAULT, DEFAULT, 'This is a comment about nothing at all..'),
		('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', (SELECT userID from "Users" WHERE samlID='samling_TA'), DEFAULT, DEFAULT, 'Hint, you know comments are there to do absolutely nothing...'),
		('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', (SELECT userID from "Users" WHERE samlID='samling_TA'), DEFAULT, DEFAULT, 'Bad names'),
		('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', (SELECT userID from "Users" WHERE samlID='samling_TA'), DEFAULT, DEFAULT, 'All these names are totally incomprehensible to anyone, horrible to do this!'),
		('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', (SELECT userID from "Users" WHERE samlID='samling_teacher'), DEFAULT, DEFAULT, 'Youre missing some planets, Pluto example');
     
          INSERT INTO "Mentions" VALUES (${uuid}, ${uuid}, (SELECT userID FROM "Users" WHERE samlid='samling_TA'));

          
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