package com.springboot.api;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class TravelBuddyTripSectorsController {
	
	@Autowired
	TravelBuddyTripSectorsRepository travelBuddyTripSectorsRepository;
	
	
	@GetMapping
	public ResponseEntity<TravelBuddyTripSectors> getTravelByID(@RequestParam String travelId) {
		TravelBuddyTripSectors item = travelBuddyTripSectorsRepository.findById(travelId);
		return new ResponseEntity<TravelBuddyTripSectors>(item, HttpStatus.OK);
    }
	
	@PostMapping
	public String insertIntoDynamoDB(@RequestBody TravelBuddyTripSectors item) {
		travelBuddyTripSectorsRepository.insertItem(item);
		return "Successfully inserted into DynamoDB table";
	}
	
	@PutMapping
	public String updateIntoDynamoDB(@RequestBody TravelBuddyTripSectors item) {
		travelBuddyTripSectorsRepository.updateItem(item);
		return "Successfully updated into DynamoDB table";
	}
	
	@DeleteMapping
	public String deleteIntoDynamoDB(@RequestBody TravelBuddyTripSectors item) {
		travelBuddyTripSectorsRepository.deleteItem(item);
		return "Successfully deleted into DynamoDB table";
	}
}
