var src = './src';
if (location.href.indexOf('github')!==-1){
	src = '/tmall/src';
}
KISSY.config({
    packages: {
        "tmall-f2e":{
            tag: "20130618",
            base: src,
            charset: "utf-8",
            ignorePackageNameInUri:true,
            debug: true
        }
    }
});