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
const uuid0 = `'00000000-0000-0000-0000-000000000000'`,
      uuid1 = `'00000000-0000-0000-0000-000000000001'`,
      uuid2 = `'00000000-0000-0000-0000-000000000002'`,
      uuid3 = `'00000000-0000-0000-0000-000000000003'`,
      uuid4 = `'00000000-0000-0000-0000-000000000004'`,
      uuid5 = `'00000000-0000-0000-0000-000000000005'`,
      uuid6 = `'00000000-0000-0000-0000-000000000006'`,
      permissionType = `0::bit(${permissionBits})`

export function databaseSamples(client : pgDB = pool) : Promise<void> {
     const query = `
     INSERT INTO "Users" VALUES
          (DEFAULT, NULL, 'normal', 'Cas@Caaas', 'admin', ${permissionType}, '$2b$10$/AP8x6x1K3r.bWVZR8B.l.LmySZwKqoUv8WYqcZTzo/w6.CHt7TOu'),
          (${uuid0}, 'samling_admin','Cs', 'admin@Cas', 'admin', ${permissionType}, ''),
          (DEFAULT, 'samling_user','Cas', 'user@Cas', 'user', ${permissionType}, ''),
          (DEFAULT, 'samling_teacher','Caas', 'teacher@Cas', 'user', ${permissionType}, ''),
          (DEFAULT, 'samling_TA','Caaas', 'TA@Cas', 'user', ${permissionType}, ''),
          (DEFAULT, NULL, 'PMD', 'pmd@plugin', 'plugin', ${permissionType}, ''),
          (${uuid6}, NULL, 'test user', 'test@test', 'user', ${permissionType}, '');

     INSERT INTO "Plugins" VALUES
          ((SELECT userID FROM "Users" WHERE globalRole='plugin' LIMIT 1), 
          'http://localhost:8080/atelier-pmd/hook', 
          'Super$ecretWebh00k$ecret', 
          '-----BEGIN CERTIFICATE-----
         MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAhtNUfBsngFxBI06YuRO3
         b3MY7z0fzrnco0oQeUF8JUrk/zTTi99mZRsP9TH43pGglKgyQVfzhvLey+YZABKX
         /Q5nMC4kqQqezQ6S2yO3H0T+OwAcJco2DZyaTp268aj8H3jF5wzPeqhW4ca+3I+U
         SWTp831FHwLj3/Th5jiIpaScontQtCy+BJAKzj7OOIChUTOLE1xZGkthr65lSOkg
         cTNM9OwfQfGNMPPTJr2WJP5lrM+emcnAt3G9QSMKaI6MgR5iodBjDBggiSmdSANH
         VHj8DA+aZ4jrN1hF46nYIXXM3O2LlWoOhgOaogEAB98nqaG5y2zTStUhRQfB9Yse
         YQIDAQAB
         -----END CERTIFICATE-----');
     
     INSERT INTO "PluginHooks" VALUES
          ((SELECT pluginID FROM "Plugins" LIMIT 1),
          'submission.file'
          );
	
     INSERT INTO "Courses" VALUES 
          (${uuid0}, 'Pearls of Computer Science', DEFAULT, (SELECT userID from "Users" LIMIT 1)),
		(${uuid1}, 'Art, Impact and Technology', DEFAULT, (SELECT userID from "Users" LIMIT 1));
	
	
     INSERT INTO "CourseRegistration" VALUES
          ((SELECT courseID from "Courses" LIMIT 1), (SELECT userID from "Users" LIMIT 1), 'student', 3${permissionType}),
          (${uuid0}, (SELECT userID from "Users" WHERE samlID='samling_user'), 'student', ${permissionType}),
          (${uuid0}, (SELECT userID from "Users" WHERE samlID='samling_teacher'), 'teacher', ${permissionType}),
          (${uuid0}, (SELECT userID from "Users" WHERE samlID='samling_TA'), 'TA', ${permissionType}),
          (${uuid0}, (SELECT userID from "Users" WHERE globalRole='plugin'), 'plugin', ${permissionType}),
	    (${uuid1}, (SELECT userID from "Users" WHERE samlID='samling_user'), 'student', ${permissionType}),
	    (${uuid1}, (SELECT userID from "Users" WHERE samlID='samling_teacher'), 'teacher', ${permissionType}),
	    (${uuid1}, (SELECT userID from "Users" WHERE samlID='samling_TA'), 'TA', ${permissionType}),
	    (${uuid1}, (SELECT userID from "Users" WHERE globalRole='plugin'), 'plugin', ${permissionType});
	    
     INSERT INTO "Submissions" VALUES
          (${uuid0}, ${uuid0}, ${uuid0}, 'MyFirstSubmission', DEFAULT, DEFAULT),
		(${uuid1}, ${uuid1}, (SELECT userID from "Users" WHERE samlID='samling_user'), 'Planets', DEFAULT, DEFAULT);
		
     INSERT INTO "Files" VALUES
	     (${uuid0}, (SELECT submissionID from "Submissions" LIMIT 1), 'uploads/00000000-0000-0000-0000-000000000000/MyFirstSubmission/MyFirstSubmission', 'processing'),
	     (${uuid1}, ${uuid1}, 'Planets/Perlin.pde', 'text/x-java'),
	     (${uuid2}, ${uuid1}, 'Planets/Planets.pde', 'text/x-java'),
	     (${uuid3}, ${uuid1}, 'Planets/data/mercury.jpg', 'image/jpg'),
	     (${uuid4}, ${uuid1}, 'Planets/data/planet.jpg', 'image/jpg'),
	     (${uuid5}, ${uuid1}, 'Planets/data/starfield.jpg', 'image/jpg'),
	     (${uuid6}, ${uuid1}, 'Planets/data/sun.jpg', 'image/jpg');
	     
     INSERT INTO "Snippets" VALUES
          (    ${uuid0}, 
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
	     (${uuid1}, 
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
	     (${uuid2}, 
	          57, 57, 2, 10, 
               'cloudtex',
               'this is a line before the item, as context',
               'this is a line after the item, as context'
	     ),
	     (${uuid3}, 
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
          ${uuid4},
          -1, -1, -1, -1,
          '','',''
     );
	     
     INSERT INTO "CommentThread" VALUES
          (${uuid0}, (SELECT submissionID from "Submissions" LIMIT 1), (SELECT fileID from "Files" LIMIT 1), ${uuid0}, DEFAULT),
          (DEFAULT, (SELECT submissionID from "Submissions" LIMIT 1), (SELECT fileID from "Files" LIMIT 1), 'ffffffff-ffff-ffff-ffff-ffffffffffff', DEFAULT),
		(${uuid1}, ${uuid1}, ${uuid2}, ${uuid1}, DEFAULT),
		(${uuid2}, ${uuid1}, ${uuid2}, ${uuid2}, DEFAULT),
		(${uuid3}, ${uuid1}, ${uuid1}, ${uuid3}, DEFAULT),
		(${uuid4}, ${uuid1}, (SELECT fileid FROM "Files" WHERE submissionid=${uuid1} AND type='undefined/undefined'), ${uuid4}, DEFAULT);
	
     INSERT INTO "Comments" VALUES
          (${uuid0}, (SELECT commentThreadID from "CommentThread" LIMIT 1), (SELECT userID from "Users" LIMIT 1), DEFAULT, DEFAULT, 'This is comment 0. It has a mention to @Caaas, a TA.'),
          (${uuid5}, (SELECT commentThreadID from "CommentThread" LIMIT 1), (SELECT userID from "Users" LIMIT 1), DEFAULT, DEFAULT, 'This is a multi\\nline comment, mentioning \\nall @teachers in one go!'),
          (DEFAULT, (SELECT commentThreadID from "CommentThread" LIMIT 1), (SELECT userID from "Users" LIMIT 1), DEFAULT, DEFAULT, 'This is a comment about nothing at all..'),
		(${uuid1}, ${uuid1}, (SELECT userID from "Users" WHERE samlID='samling_TA'), DEFAULT, DEFAULT, 'Hint, you know comments are there to do absolutely nothing...'),
		(${uuid2}, ${uuid2}, (SELECT userID from "Users" WHERE samlID='samling_TA'), DEFAULT, DEFAULT, 'Bad names'),
		(${uuid3}, ${uuid3}, (SELECT userID from "Users" WHERE samlID='samling_TA'), DEFAULT, DEFAULT, 'All these names are totally incomprehensible to anyone, horrible to do this!'),
		(${uuid4}, ${uuid4}, (SELECT userID from "Users" WHERE samlID='samling_teacher'), DEFAULT, DEFAULT, 'Youre missing some planets, Pluto example');
     
          INSERT INTO "Mentions" VALUES 
               (${uuid0}, ${uuid0}, (SELECT userID FROM "Users" WHERE samlid='samling_TA'), null),
               (${uuid1}, ${uuid5}, NULL, 'teacher');

          
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