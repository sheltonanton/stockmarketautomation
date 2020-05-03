function infinite(){
	console.log("Running");
	setTimeout(infinite, 1000);
}
setTimeout(infinite, 10000);

