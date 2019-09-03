//#region : Variables
var fs = require('fs');
var util = require('util'); 
 
var workingdirectory='D:\\Vasanth\\Technical Documents\\Hackathon\\IPL 2019\\NLQuote_APIs\\InputFiles\\';
var hoteldata=[];
var flightdata=[];
var restaurantdata=[];
var rentalcardata=[];
var userdata=[];
var UserID=[]
var Input_UserId="James";
//#endregion

//#region Classes creation
class GoogleEvents{
    constructor(userid,context,type,reservationNumber,reservationStatus,name,event,quoteamount,issent){
        this.context=context;
        this.type=type;
        this.reservationNumber=reservationNumber;
        this.reservationStatus=reservationStatus;
        this.name=name;
        this.event=event;
        //this.QuoteAmount=parseInt(String(quoteamount).replace("$","")) *0.3;
        this.QuoteAmount= parseInt(quoteamount) *0.3;
        this.IsSent=issent;
    }
}

class FlightEvent extends GoogleEvents{
    constructor(jsonContent){
        super(jsonContent['UserId'],jsonContent['@context'], jsonContent['@type'],jsonContent.reservationNumber, jsonContent.reservationStatus,jsonContent.underName.name,jsonContent.reservationFor['@type'],jsonContent['BookedBookedAmount'],false);
        this.flightnumber=jsonContent.reservationFor.flightNumber;
        this.airLine=jsonContent.reservationFor.airline.name;
        this.departureAirport=jsonContent.reservationFor.departureAirport.iataCode ;
        this.departureTime=DataTimeFormatting(jsonContent.reservationFor.departureTime);
        this.arrivalAirport=jsonContent.reservationFor.arrivalAirport.iataCode;
        this.arrivalTime=DataTimeFormatting(jsonContent.reservationFor.arrivalTime );
        
    }
   
}
class HotelEvent extends GoogleEvents{
    constructor(jsonContent){
        super(jsonContent['UserId'],jsonContent['@context'], jsonContent['@type'],jsonContent.reservationNumber, jsonContent.reservationStatus,jsonContent.underName.name,jsonContent.reservationFor['@type'],jsonContent['BookedBookedAmount'],false);
        this.Hotel=jsonContent.reservationFor.name;
        this.addres=jsonContent.reservationFor.address.addressLocality ;
        this.addressLocality=jsonContent.reservationFor.address.streetAddress;
        this.telephone=jsonContent.reservationFor.telephone ;
        this.checkinDate=DataTimeFormatting(jsonContent.checkinDate);
        this.checkoutDate=DataTimeFormatting(jsonContent.checkoutDate);

    }
}
class RestaurantEvent extends GoogleEvents{
    constructor(jsonContent){
        super(jsonContent['UserId'],jsonContent['@context'], jsonContent['@type'],jsonContent.reservationNumber, jsonContent.reservationStatus,jsonContent.underName.name,jsonContent.reservationFor['@type'],jsonContent['BookedBookedAmount'],false);
        this.Restaurant=jsonContent.reservationFor.name;
        this.addres=jsonContent.reservationFor.address.addressLocality ;
        this.addressLocality=jsonContent.reservationFor.address.streetAddress;
        this.startTime=DataTimeFormatting(jsonContent.startTime);
        this.partySize=jsonContent.partySize;
        

    }
}
class RentalCarEvent extends GoogleEvents{
    constructor(jsonContent){
        super(jsonContent['UserId'],jsonContent['@context'], jsonContent['@type'],jsonContent.reservationNumber, jsonContent.reservationStatus,jsonContent.underName.name,jsonContent.reservationFor['@type'],jsonContent['BookedBookedAmount'],false);
        this.rentalCompanyname=jsonContent.reservationFor.rentalCompany.name;
        this.pickupLocation=jsonContent.pickupLocation.name;
        this.pickupAddress=jsonContent.pickupLocation.address.streetAddress;
        this.pickupAddresslocality=jsonContent.pickupLocation.address.addressLocality;
        this.pickupTime=DataTimeFormatting(jsonContent.pickupTime);
        this.dropoffLocation=jsonContent.dropoffLocation.name;
        this.dropoffAddress=jsonContent.dropoffLocation.address.streetAddress;
        this.dropoffAddresslocality=jsonContent.dropoffLocation.address.addressLocality;
        this.dropoffTime=DataTimeFormatting(jsonContent.dropoffTime);
    }
}

class User{
    constructor(hoteldata,flightdata,restaurantdata,rentalcardata)
    {       
        if( typeof(hoteldata)!="undefined"){
            this.Hotel=hoteldata;           
        }
        if( typeof(flightdata)!="undefined"){
            this.Flight=flightdata;           
        }
        if( typeof(restaurantdata)!="undefined"){
            this.Restaurant=restaurantdata;            
        }
        if( typeof(rentalcardata)!="undefined"){
            this.RentalCarData=rentalcardata;            
        }
    }    
}

//user datetime formating converting  YYYY-MM-DDTHH:MM:SS-MS:MS to MM/DD/YYYY hh:mm 
function DataTimeFormatting(inputdate)
{
    var date=inputdate.split('T')[0]
    date=date.split('-')[1]+"/"+date.split('-')[2]+"/"+date.split('-')[0]
    if(inputdate.split('T')[1].includes('+'))
    {
        var time=inputdate.split('T')[1].split('+')[0]
        time=time.split(':')[0]+":"+time.split(':')[1]
    }
    else
    {
        var time=inputdate.split('T')[1].split('-')[0]
        time=time.split(':')[0]+":"+time.split(':')[1]
    }
    
    return date+" "+time;
}

//finding event and creating object for eventtype and adding object to relevant list
function CreateModel(jsonContent)
{
    if(jsonContent.reservationFor['@type'] == "LodgingBusiness")
    {
        var temp_Hoteldata=new HotelEvent(jsonContent)
        UserID.push(temp_Hoteldata.UserId)
        hoteldata.push(temp_Hoteldata);   
    }
    else if(jsonContent.reservationFor['@type'] == "Flight")
    {
        var temp_FlightData=new FlightEvent(jsonContent);
        UserID.push(temp_FlightData.UserId);
        flightdata.push(temp_FlightData);
    }
    else if(jsonContent.reservationFor['@type'] == "RentalCar")
    {
        var temp_RentalCar=new RentalCarEvent(jsonContent);
        UserID.push(temp_RentalCar.UserId);
        rentalcardata.push(temp_RentalCar);
        
    }else if(jsonContent.reservationFor['@type'] == "FoodEstablishment")
    {
        var temp_RestaurantData=new RestaurantEvent(jsonContent);
        UserID.push(temp_RestaurantData.UserId);
        restaurantdata.push(temp_RestaurantData);
    }
}

function UserModel(hoteldata,flightdata,restaurantdata,carrentaldata)
{
    //get unique userid
    let unique = UserID.filter((item, arr, ar) => ar.indexOf(item) === arr);
    //console.log(unique);

    //get unique userid data from user array
    var uniqueSizedData=UserID.filter((item, arr, ar) => ar.indexOf(item) === arr);   
    var temp;

    for(temp=0;temp<uniqueSizedData.length;temp++)
    {
        var hoteldataindex="";
        var flightSearchedIndex="";
        var restaurantSearchedIndex="";
        var carRentalSearchedIndex="";
        //checking if there is relevent user in flight equal to hotel                  
        if(hoteldata.some(data=>data.UserId == uniqueSizedData[temp]))
         {
            hoteldataindex=hoteldata.map(function(e) { return e.UserId; }).indexOf(uniqueSizedData[temp]);
        }
        if(flightdata.some(data=>data.UserId == uniqueSizedData[temp]))
        {
            flightSearchedIndex=flightdata.map(function(e) { return e.UserId; }).indexOf(uniqueSizedData[temp]);
        }
        //checking if there is relevent user in restaurant equal to hotel
        if(restaurantdata.some(data=>data.UserId == uniqueSizedData[temp]))
        {
            restaurantSearchedIndex=restaurantdata.map(function(e) { return e.UserId; }).indexOf(uniqueSizedData[temp]);
        }
        //checking if there is relevent user in car rental equal to hotel
        if(carrentaldata.some(data=>data.UserId == uniqueSizedData[temp])){
            carRentalSearchedIndex=carrentaldata.map(function(e) { return e.UserId; }).indexOf(uniqueSizedData[temp]);
        }
        //creating user object and adding to user list
        userdata.push(new User(hoteldata[hoteldataindex],flightdata[flightSearchedIndex],restaurantdata[restaurantSearchedIndex],rentalcardata[carRentalSearchedIndex]));
    }
    // Return the final resultset    
    return userdata;
}

//#region : Read the directory which has all the reservations
fs.readdirAsync = function(dirname) {
    return new Promise(function(resolve, reject) {
        fs.readdir(dirname, function(err, filenames){
            if (err) 
                reject(err); 
            else 
                resolve(filenames);
        });
    });
};
//#endregion 

//#region : Utility function - To read the file name
function getFile(filename) {
    return fs.readFileAsync(filename, 'utf8');

}
//#endregion 

//#region : TODO *** Read the file one by one and try to append 
fs.readFileAsync = function(filename, enc) {
    return new Promise(function(resolve, reject) {
        fs.readFile(filename, enc, function(err, data){
            if (err) 
                reject(err); 
            else
            {
              resolve(data);
              // Need to split the logic here for each EVENT
              //ExtractModel(JSON.parse(data));
              //creating objects and adding to list
              CreateModel(JSON.parse(data));
            }             
        });        
    }); 
};
//#endregion 

//#region : Exclude the other files if any in the directory * <Userid_Event_LOC_StartDate>
function isDataFile(filename) 
{
  // Split the extension and get the full filename  
  let fnString = filename.split('.')[0]; 
  //Split the Event details for the user 
  return (filename.split('.')[1] == 'json' 
          && filename.split('_')[0]== Input_UserId                      //James is hardcoded value
          && (fnString.split('_')[1] == 'FoodEstablishmentReservation'  //Restuarant
          || fnString.split('_')[1] == 'LodgingReservation'             //Hotel
          || fnString.split('_')[1] == 'RentalCarReservation'           //RentalCar
          || fnString.split('_')[1] == 'FlightReservation')             //Flight
         );
}
//#endregion 

//#region - PAGE_LOAD Read all json files in the directory, filter out those needed to process, 
process.chdir(workingdirectory);
fs.readdirAsync('./').then(function (filenames)
{    
    filenames = filenames.filter(isDataFile);   
    // Bind only the filtered JSON names
    console.log("Processing FileNames : " + filenames); 

    return Promise.all(filenames.map(getFile));  
}).then(function()
{
    //appending different data to user filter and making user array out of it
    var finalobj = UserModel(hoteldata,flightdata,restaurantdata,rentalcardata);
    if(finalobj.length>0)
    {
        //console.log("1" + JSON.parse(JSON.stringify(finalobj[0])));
    }
    else
    {
        console.log("No Data for "+ Input_UserId);
    }    
   //final writing of object_userdata to json file for each user
    var filename = "";
    for(var arr=0; arr<finalobj.length; arr++)
    {
        //geting userid  and creating filename
        filename = "" + finalobj[arr].UserIdval +"";
        if(finalobj[arr].hasOwnProperty('RentalCarData')){}                
        else if(finalobj[arr].hasOwnProperty('Hotel')){}                
        else if(finalobj[arr].hasOwnProperty('Flight')){}               
        else if(finalobj[arr].hasOwnProperty('Restaurant')){}
        //Instead we need to return to WebAPi o/p    
        console.log(Input_UserId + ": " + util.inspect(JSON.parse(JSON.stringify(finalobj[arr]).replace("User","").replace("Id","UserId"))));
        //write file to path
        //create output folder if not exist
        var mkdirdata="output"+ " "+String(Date(String(Date.now()), 0744)).split("GMT")[0].trim().replace(/:/g,".");
        if(!fs.existsSync(process.cwd()+"\\"+mkdirdata))
        {     fs.mkdirSync(mkdirdata);
        }        
        fs.writeFileSync("./"+ mkdirdata +"/"+ Input_UserId +'.json', Input_UserId + ": " + util.inspect(JSON.parse(JSON.stringify(finalobj[arr]).replace("User","").replace("Id","UserId"))) , 'utf-8');        
    }    
});
//#endregion
