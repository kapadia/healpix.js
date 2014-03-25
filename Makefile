
EMSCRIPTEN=$(HOME)/emscripten

build: healpix.js
	cat src/start.js healpix.js src/end.js > healpix2.js
	mv healpix2.js healpix.js

healpix.js: Healpix_3.11
	$(EMSCRIPTEN)/emcc Healpix_3.11/src/C/subs/chealpix.c -o healpix.js -s EXPORTED_FUNCTIONS="[ \
		'_ang2vec', \
		'_vec2ang', \
		'_ang2pix_ring', \
		'_ang2pix_nest', \
		'_vec2pix_ring', \
		'_vec2pix_nest', \
		'_pix2ang_ring', \
		'_pix2ang_nest', \
		'_pix2vec_ring', \
		'_pix2vec_nest', \
		'_nest2ring', \
		'_ring2nest', \
		'_ang2pix_ring64', \
		'_ang2pix_nest64', \
		'_vec2pix_ring64', \
		'_vec2pix_nest64', \
		'_pix2ang_ring64', \
		'_pix2ang_nest64', \
		'_pix2vec_ring64', \
		'_pix2vec_nest64', \
		'_nest2ring64', \
		'_ring2nest64', \
		'_xyf2nest', \
		'_nest2xyf', \
		'_xyf2ring', \
		'_ring2xyf', \
		'_ang2pix_nest_z_phi', \
		'_ang2pix_ring_z_phi', \
		'_pix2ang_ring_z_phi', \
		'_pix2ang_nest_z_phi', \
		'_xyf2nest64', \
		'_nest2xyf64', \
		'_xyf2ring64', \
		'_ring2xyf64', \
		'_ang2pix_nest_z_phi64', \
		'_ang2pix_ring_z_phi64', \
		'_pix2ang_ring_z_phi64', \
		'_pix2ang_nest_z_phi64', \
		'_setCoordSysHP', \
	]";

Healpix_3.11: Healpix_3.11_2013Apr24.tar.gz
	tar xjf Healpix_3.11_2013Apr24.tar.gz

Healpix_3.11_2013Apr24.tar.gz:
	curl -L "http://downloads.sourceforge.net/project/healpix/Healpix_3.11/Healpix_3.11_2013Apr24.tar.gz" -o "Healpix_3.11_2013Apr24.tar.gz"
	
clean:
	rm healpix.js
	rm healpix.js.map