var Product = require ('../models/product');
var mongoose = require('mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/shopping", { useNewUrlParser: true ,useUnifiedTopology: true});
var products =[
	  new Product({
        imagePath: '/images/indeximages/promo1.jpg',
        title: 'Javascript',
        description: 'JavaScript (JS) is a lightweight, interpreted, or just-in-time compiled programming language with first-class functions. While it is most well-known as the scripting language for Web pages, many non-browser environments also use it, such as Node.js, Apache CouchDB and Adobe Acrobat. JavaScript is a prototype-based, multi-paradigm, single-threaded, dynamic language, supporting object-oriented, imperative, and declarative (e.g. functional programming) styles.',
        price: 1200
    }),
    new Product({
        imagePath: '/images/indeximages/promo-2.jpeg',
        title: 'C Programming',
        description: 'C (/siː/, as in the letter c) is a general-purpose, procedural computer programming language supporting structured programming, lexical variable scope, and recursion, while a static type system prevents unintended operations. By design, C provides constructs that map efficiently to typical machine instructions and has found lasting use in applications previously coded in assembly language ',
        price: 1000
    }),
    new Product({
        imagePath: '/images/indeximages/promo3.jpg',
        title: ' Express Js',
        description: 'Web Applications Express is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.APIs a myriad of HTTP utility methods and middleware at your disposal, creating a robust API is quick and easy.Express provides a thin layer of fundamental web application features, without obscuring Node.js features that you know and love.',
        price: 1600
    }),
     new Product({
        imagePath: '/images/indeximages/extra.jpg',
        title: ' Java',
        description: 'Java is a general-purpose programming language that is class-based, object-oriented, and designed to have as few implementation dependencies as possible. It is intended to let application developers write once, run anywhere (WORA),[17] meaning that compiled Java code can run on all platforms that support Java without the need for recompilation.[18] Java applications are typically compiled to bytecode that can run on any Java virtual machine (JVM) regardless of the underlying computer architecture.',
        price: 1600
    }),
];

	
done=0;
for (var i = 0; i< products.length; i++) {
	products[i].save(function(err,result){
		done++;
		if (done===products.length){
			exit();
		}
	});
}
function exit()
{
mongoose.disconnect();
}
console.log('running');