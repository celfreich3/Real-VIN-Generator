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
  
  qrEnabled: Boolean = true;
  
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
      this.selectedYear = -1
      this.possibleYears = []
    }
    else {
      let url = "https://hav85l31jh.execute-api.us-east-1.amazonaws.com/Dev/ctf-vin-info"
      const header = new HttpHeaders({"Content-Type": "application/json", "make": this.selectedMake, "model": this.selectedModel, "EventType": "get_vin"})
      this.http.get(url, {headers: header}).subscribe((data: JSON) => {
        this.possibleYears = data["values"]
        this.selectedYear = -1
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
        this.Make = this.selectedMake
        this.Model = this.selectedModel
        this.Year = this.selectedYear
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

  ClearInput() {
    this.selectedMake = "unspecified"
    this.selectedModel = "unspecified"
    this.selectedYear = -1
    this.possibleModels = []
    this.possibleYears = []
  }
  
  
  
}
