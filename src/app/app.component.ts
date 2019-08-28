import { Component, OnInit } from '@angular/core';
import {HttpClient, HttpEventType, HttpHeaders} from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  
  constructor(private http: HttpClient) { }
  
  qrElementType: string = "img";
  barcodeFormat: string = "CODE39"
  barcodeElementType: string = "img"
  
  VIN: string;
  
  Year: number;
  Make: string;
  Model: string;
  
  DBGenEnabled: Boolean = true;
  qrEnabled: Boolean = true;

  manualEntry: string;

  
  possibleMakes: string[];
  possibleModels: string[];
  possibleYears: number[];
  selectedMake: string = "unspecified";
  selectedModel: string = "unspecified";
  selectedYear: number = -1;
  
  ngOnInit() {
    this.RandomVIN()
    this.GetMakes()
  }
  
  RandomVIN() {
    let url = "https://hav85l31jh.execute-api.us-east-1.amazonaws.com/Dev/ctf-vin-info"
    const header = new HttpHeaders({"Content-Type": "application/json", "EventType": "random_vin"})
    this.http.get(url, {headers: header}).subscribe((data: JSON) => {
      
      this.Make = data["make"] as string;
      this.Model = data["model"] as string;
      let years = data["years"] as [number];
      this.Year = years[0];
      
      this.VIN = data["vin"];
      
    })
  }
  
  GetMakes() {
    let url = "https://hav85l31jh.execute-api.us-east-1.amazonaws.com/Dev/ctf-vin-info"
    const header = new HttpHeaders({"Content-Type": "application/json", "EventType": "get_vin"})
    this.http.get(url, {headers: header}).subscribe((data: JSON) => {
      this.possibleMakes = data["values"]
    })
  }
  
  GetModels(newValue) {
    this.selectedMake = newValue;
    if (this.selectedMake == "unspecified") {
      this.selectedModel = "unspecified"
      this.selectedYear = -1
      this.possibleModels = []
      this.possibleYears = []
    }
    else {
      let url = "https://hav85l31jh.execute-api.us-east-1.amazonaws.com/Dev/ctf-vin-info"
      const header = new HttpHeaders({"Content-Type": "application/json", "make": this.selectedMake, "EventType": "get_vin"})
      this.http.get(url, {headers: header}).subscribe((data: JSON) => {
          this.possibleModels = data["values"]
          this.selectedModel= "unspecified"
          this.selectedYear = -1
      })
    }
    
  }
  
  GetYears(newValue) {
    this.selectedModel = newValue;
    if (this.selectedModel == "unspecified") {
      this.selectedYear = -1;
      this.possibleYears = [];
    }
    else {
      let url = "https://hav85l31jh.execute-api.us-east-1.amazonaws.com/Dev/ctf-vin-info"
      const header = new HttpHeaders({"Content-Type": "application/json", "make": this.selectedMake, "model": this.selectedModel, "EventType": "get_vin"})
      this.http.get(url, {headers: header}).subscribe((data: JSON) => {
        this.possibleYears = data["values"];
        this.selectedYear = -1;
      })
    }
  }
  
  ExistingVIN() {
    
    if (this.selectedMake == "unspecified" && this.selectedModel == "unspecified" && this.selectedYear == -1) {
      let url = "https://hav85l31jh.execute-api.us-east-1.amazonaws.com/Dev/ctf-vin-info"
      this.http.get(url, {headers: {"EventType": "get_vin"}}).subscribe((data: [String]) => {
        this.Make = data["make"] as string;
        this.Model = data["model"] as string;
        let years = data["years"] as [number];
        this.Year = years[0];
        this.VIN = data["vin"];
      })
    }
    else if (this.selectedMake != "unspecified" && this.selectedModel != "unspecified" && this.selectedYear != -1) {
      let url = "https://hav85l31jh.execute-api.us-east-1.amazonaws.com/Dev/ctf-vin-info"
      const header = new HttpHeaders({"Content-Type": "application/json", "make": this.selectedMake, "model": this.selectedModel, "year": this.selectedYear.toString(), "EventType": "get_vin"})
      this.http.get(url, {headers: header}).subscribe((data: JSON) => {
        this.Make = this.selectedMake;
        this.Model = this.selectedModel;
        this.Year = this.selectedYear;
        this.VIN = data["vin"];
      })
    }
    else if (this.selectedMake == "unspecified") {
      alert("You must select a Model and Year to submit a specific Make")
    }
    else {
      alert("You must select a Year to submit a specific Make and Model")
    }
    
  }

  validateVin(vin) {
    if (vin == "11111111111111111") { return false; }
    if (!vin.match("^([0-9a-hj-npr-zA-HJ-NPR-Z]{10,17})+$")) { return false;}
    var letters = [{ k: "A", v: 1 }, { k: "B", v: 2 }, { k: "C", v: 3 },
    { k: "D", v: 4 }, { k: "E", v: 5 }, { k: "F", v: 6 }, { k: "G", v: 7 },
    { k: "H", v: 8 }, { k: "J", v: 1 }, { k: "K", v: 2 }, { k: "L", v: 3 },
    { k: "M", v: 4 }, { k: "N", v: 5 }, { k: "P", v: 7 }, { k: "R", v: 9 },
    { k: "S", v: 2 }, { k: "T", v: 3 }, { k: "U", v: 4 }, { k: "V", v: 5 },
    { k: "W", v: 6 }, { k: "X", v: 7 }, { k: "Y", v: 8 }, { k: "Z", v: 9 }];
    var weights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];
    var exclude = ["I", "O", "Q"];
    var val = 0;
    for (var idx = 0; idx < vin.length; idx++) {
        var item = vin.charAt(idx).toUpperCase();
        if (exclude.includes(item)) { return false; }
        var pos = (item.match("^[0-9]+$") != null) ? parseInt(item) : letters.filter(function (letter) { return letter.k == item; })[0].v;
        val += (pos * weights[idx]);
    }
    var checksum = (val % 11);
    return (vin.charAt(8) == (checksum < 10 ? checksum.toString() : "X"));
  };

  VerifyVIN() {
    if(this.validateVin(this.manualEntry)) {
      alert("Valid VIN.")
    }
    else {
      alert("Not a valid VIN.")
    }
  }

  ManualVIN() {
    this.VIN = this.manualEntry;
    this.Make = "-Make-";
    this.Model = "-Model-";
    this.Year = null;
  }

  ClearInput() {
    this.selectedMake = "unspecified"
    this.selectedModel = "unspecified"
    this.selectedYear = -1
    this.possibleModels = []
    this.possibleYears = []
  }
  
  
  
}
