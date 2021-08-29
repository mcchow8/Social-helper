export function timeStampToString (time,type="all"){
	function addZero(time){
		return( 
			(time<10?"0":"")+time.toString()
		)
	}
	const datetime = new Date(time);
	if(type==="all"){
		const year = datetime.getFullYear();
		const month = addZero(datetime.getMonth() + 1);
		const date = addZero(datetime.getDate());
		const hour = addZero(datetime.getHours());
		const minute = addZero(datetime.getMinutes());
		return hour+":"+minute+" "+date+"/"+ month+"/"+year;
	}else if(type==="dmy"){
		const year = datetime.getFullYear();
		const month = addZero(datetime.getMonth() + 1);
		const date = addZero(datetime.getDate());
		return date+"/"+ month+"/"+year;
	}else if(type==="hm"){
		const hour = addZero(datetime.getHours());
		const minute = addZero(datetime.getMinutes());
		return hour+":"+minute;
	}
};