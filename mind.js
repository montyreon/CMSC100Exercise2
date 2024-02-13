// Name: Jerico Roen B. de Vega
// Section: CMSC 12 T1-1L
// Project: Movie Theater Booking System
// Description: An HTML-CSS-JavaScript (no APIs or frameworks used) movie theatre booking system for managing movie screening records, and a cashier interface for booking seats.
// ___________________________________________________________________________________________________________________________________________________________


// Movie entry format:
//['Movie ID', 'Movie Title', 'Genre', 'Restriction', 'Venue', 'Date', 'Start Time', 'End Time', 'Price', [row1], [row2], [row3], [row4], [row5], 'Earnings']
//     0             1           2            3          4       5          6            7          8       9      10      11      12       13       14
mainList = [];
movieEntry = [];
voucherCodes = { "CAS50": 0.5, "FRI20": 0.2 };
maxMovieID = 0;

//======================================================
//DATA MANIPULATION AND OPERATION FUNCTIONS
//------------------------------------------------------
//Returns a new unique and incremented movie ID 
function newMovieID() {
    let newID = '000' + (parseInt(maxMovieID) + 1);
    while (newID.length > 4) {
        newID = newID.slice(1);
    }
    return newID;
}
//Returns the index of the movie in the mainList given its movie ID.
function getIndexFromMovieID(id) {
    for (let i = 0; i < mainList.length; i++) {
        if (mainList[i][0] == id) {
            return i;
        }
    }
}
//Returns an array of movie entries sorted by day then time.
function getSortedList() {
    let sortingList = [];
    let sortedList = [];
    let returnList = [];

    for (let i = 0; i < mainList.length; i++) {
        let year = mainList[i][5].split('-')[0];
        let month = mainList[i][5].split('-')[1];
        let day = mainList[i][5].split('-')[2];
        let hour = mainList[i][6].split(':')[0];
        let minute = mainList[i][6].split(':')[1];
        let date = new Date();
        date.setFullYear(year, month, day);
        date.setHours(hour, minute);
        //Format of entries for easier sorting: [movieID, movieStartTimeInMilliseconds]
        sortingList.push([mainList[i][0], date.getTime()]);
    }

    //Sort by repeatedly taking the smallest (earliest) time value among the entries in the list.
    while (sortingList.length > 1) {
        //Separate the first entry and make it the reference for comparison.
        let earliestEntry = sortingList.shift();
        for (let i = 0; i < sortingList.length; i++) {
            if (sortingList[i][1] < earliestEntry[1]) {
                let temporary = earliestEntry;
                earliestEntry = sortingList[i];
                sortingList[i] = temporary;
            }
        }
        sortedList.push(earliestEntry);
    }
    sortedList.push(sortingList[0]);

    //Use the sorted simplified list to create a sorted list (with complete details) from the main list
    for (let i = 0; i < sortedList.length; i++) {
        for (let j = 0; j < mainList.length; j++) {
            if (sortedList[i][0] == mainList[j][0]) {
                returnList.push(mainList[j]);
                break;
            }
        }
    }
    return returnList;
}
function filterListByTitle(title, list) {
    matchesFound = [];
    list.forEach((movie, index) => {
        if (title == movie[1]) {
            matchesFound.push(list[index]);
        }
    });
    return matchesFound;
}
function filterListByDate(date, list) {
    matchesFound = [];
    list.forEach((movie, index) => {
        if (date == movie[5]) {
            matchesFound.push(list[index]);
        }
    });
    return matchesFound;
}
function filterListByCinema(cinema, list) {
    matchesFound = [];
    list.forEach((movie, index) => {
        if (cinema == movie[4]) {
            matchesFound.push(list[index]);
        }
    });
    return matchesFound;
}
//======================================================



//======================================================
//SAVE LOAD FUNCTIONS
//------------------------------------------------------
//Converts a movie entry into a string. Each value is separated by ▓, and subvalues for rows are separated by ░
function convertToString(initial) {
    let stringified = ""
    initial.forEach((value, index) => {
        let temp = value;
        if ([9, 10, 11, 12, 13].indexOf(index) != -1) {
            temp = "";

            for (i = 0; i < value.length; i++) {
                temp = temp + value[i];
                if (i < value.length - 1) {
                    temp = temp + "░";
                }
            }
        }
        stringified = stringified + temp;
        if (index < initial.length - 1) {
            stringified = stringified + "▓";
        }
    });
    return stringified
}
//Saving function, downlaods a save text file that can be loaded back to the program.
function saveToFile() {
    //Converts the mainList into a single string with separators for each value; the max movieID counter is also saved.
    stringToSave = maxMovieID + "■";
    mainList.forEach((entry, index) => {
        stringToSave = stringToSave + convertToString(entry);
        if (index < mainList.length - 1) {
            stringToSave = stringToSave + "■";
        }
    });
    //Creates a text file Blob object containing the detokenized string of all the movie entries.
    let file = new Blob([stringToSave], { type: "text" });
    //Creates an <a> element
    let anchor = document.createElement("a");
    //Links the anchor element to the file.
    anchor.href = URL.createObjectURL(file);
    //Sets the file name.
    anchor.download = "bookingRecord.txt";
    //Simulates a click on the anchor element to download the save file.
    anchor.click();
}
//Load function that asks for a file upload and reads that file into the program.
function loadFromFile() {
    loadedMainList = []
    //Fetches the uploaded file.
    let file = document.getElementById('fileUpload').files[0];
    //Creates a fileReader object for reading functions.
    let reader = new FileReader();
    //Reads the file, as a text.
    reader.readAsText(file);
    //This is the function that will be run after the file is loaded. It detokenizes the inputted text, turning it into a mainList.
    reader.onload = function () {
        let readTextString = String(reader.result).split("■");
        maxMovieID = readTextString.shift();
        readTextString.forEach((value, index) => {
            let movieEntry = value.split("▓");
            let finalSubArray = [];
            movieEntry.forEach((movieDeet, deetIndex) => {
                if ([9, 10, 11, 12, 13].indexOf(deetIndex) != -1) {
                    movieDeet = movieDeet.split("░");
                }
                finalSubArray.push(movieDeet);
            });
            loadedMainList.push(finalSubArray);
        });
    }
    mainList = loadedMainList;
    if (mainList.length == 1 && mainList[0][0] == ''){
        mainList = [];
    }
}
//======================================================



//======================================================
//FORM FUNCTIONS
//------------------------------------------------------
//Show a form
function summonForm(id) {
    document.getElementById(id).style.display = "grid";
}
//Hide a form
function withdrawForm(id) {
    document.getElementById(id).style.display = "none";
}
//Move to a form; hide x then show y
function moveToForm(fromFormID, toFormID) {
    withdrawForm(fromFormID);
    summonForm(toFormID);
}
//for hiding and showing all forms, argument "none" for hide; argument "table" to show
function allFormsDisplay(display) {
    forms = document.getElementsByTagName("form");
    for (i = 0; i < forms.length; i++) {
        forms[i].style.display = display;
    }
}
//Toggle Main Menu
function toggleMainMenu() {
    if (document.getElementById("initMenu").style.display == "none") {
        document.getElementById("initMenu").style.display = "flex"
    } else {
        document.getElementById("initMenu").style.display = "none";
    }
}
//Clears the entries in a form
function resetForm(formID) {
    document.getElementById(formID).reset()
}
//======================================================



//======================================================
//ADMIN ADD AND EDIT FUNCTIONS
//------------------------------------------------------
function addMovieFunc(event) {
    event.preventDefault();
    const addMovieVenue = document.getElementById('venue');
    const addMovieDate = document.getElementById('schedDate');
    const addMovieStartTime = document.getElementById('startTime');
    const addMovieEndTime = document.getElementById('endTime');
    //Check if there is no time conflict; submit will not proceed if there is.
    if (checkTimeConflict(addMovieStartTime.value, addMovieEndTime.value, addMovieDate.value, addMovieVenue.value, '') == false) {
        maxMovieID++;
        let movieID = document.getElementById("addMovieID").innerHTML;
        let movieTitle = document.getElementById("movieName").value;
        let movieGenre = document.getElementById('genre').value;
        let movieRestriction = document.getElementById("restriction").value;
        let movieVenue = document.getElementById("venue").value;
        let movieDate = document.getElementById("schedDate").value;
        let movieStartTime = document.getElementById("startTime").value;
        let movieEndTime = document.getElementById("endTime").value;
        let moviePrice = document.getElementById("ticketPrice").value;
        let entryList = [movieID, movieTitle, movieGenre, movieRestriction, movieVenue, movieDate, movieStartTime, movieEndTime, moviePrice]
        for (let i = 0; i < 5; i++) {
            entryList.push([0, 0, 0, 0])
        }
        entryList.push(0);
        mainList.push(entryList);
        resetForm('addMovie');
        withdrawForm('addMovie');
        withdrawForm('similarScheduleForm');
        summonForm('adminInitMenu');
    }
}
//Updates the shown Movie ID in the Add Movie form.
function loadAddMovie() {
    document.getElementById('addMovieID').innerHTML = newMovieID();
    clearSimilarScheduleForm();
    summonForm("similarScheduleForm");
}
//LOAD FUNCTION for edit movies form. Updates the selection options for the user to choose which movie to edit.
function loadEditMovie() {
    document.getElementById('editMovie_ListSelect').innerHTML = '';
    for (let i = 0; i < mainList.length; i++) {
        let movieID = mainList[i][0];
        let movieTitle = mainList[i][1];
        document.getElementById('editMovie_ListSelect').innerHTML = document.getElementById('editMovie_ListSelect').innerHTML + "<option value='" + movieID + "'>" + movieID + " | " + movieTitle + "</option>";
    }
}
//SUBMIT EVENT for the edit list selection form.
function editMovie_ListFunc(event) {
    event.preventDefault();
    let movieId = document.getElementById('editMovie_ListSelect').value;
    let movieIndex = getIndexFromMovieID(movieId);
    let movieInitDetails = mainList[movieIndex];
    //Loads pre-existing data into the edit movie form.
    document.getElementById('EaddMovieID').innerHTML = movieInitDetails[0];
    document.getElementById('EmovieName').value = movieInitDetails[1];
    document.getElementById('Egenre').value = movieInitDetails[2];
    document.getElementById('Erestriction').value = movieInitDetails[3];
    document.getElementById('Evenue').value = movieInitDetails[4];
    document.getElementById('EschedDate').value = movieInitDetails[5];
    document.getElementById('EstartTime').value = movieInitDetails[6];
    document.getElementById('EendTime').value = movieInitDetails[7];
    document.getElementById('EticketPrice').value = movieInitDetails[8];
    moveToForm('editMovie_List', 'editMovie_Edit');
    clearSimilarScheduleForm()
    loadSimilarScheduleForm(movieInitDetails[5], movieInitDetails[4])
    summonForm("similarScheduleForm");
    document.getElementById("editMovie_EditSaveBtn").disabled = false;

}
//SUBMIT EVENT for the movie details editing form.
function editMovie_EditFunc(event) {
    event.preventDefault();
    const addMovieVenue = document.getElementById('Evenue');
    const addMovieDate = document.getElementById('EschedDate');
    const addMovieStartTime = document.getElementById('EstartTime');
    const addMovieEndTime = document.getElementById('EendTime');
    //Check if there is no time conflict; submit will not proceed if there is.
    if (checkTimeConflict(addMovieStartTime.value, addMovieEndTime.value, addMovieDate.value, addMovieVenue.value, document.getElementById('EaddMovieID').innerHTML) == false) {
        let i = getIndexFromMovieID(document.getElementById('EaddMovieID').innerHTML);
        //Saves the inputted details into the mainList.
        mainList[i][0] = document.getElementById('EaddMovieID').innerHTML;
        mainList[i][1] = document.getElementById('EmovieName').value;
        mainList[i][2] = document.getElementById('Egenre').value;
        mainList[i][3] = document.getElementById('Erestriction').value;
        mainList[i][4] = document.getElementById('Evenue').value;
        mainList[i][5] = document.getElementById('EschedDate').value;
        mainList[i][6] = document.getElementById('EstartTime').value;
        mainList[i][7] = document.getElementById('EendTime').value;
        mainList[i][8] = document.getElementById('EticketPrice').value;
        withdrawForm('similarScheduleForm');
        moveToForm('editMovie_Edit', 'adminInitMenu');
    }

}
//LOAD FUNCTION for similar schedule details panel.
function loadSimilarScheduleForm(date, cinema) {
    document.getElementById("similarScheduleTitle").innerHTML = "Schedule for " + cinema + " " + date;
    let similarScheduleList = filterListByCinema(cinema, filterListByDate(date, getSortedList()));
    string = "<p><b>Movie Name</b> <b>Start Time</b> <b>End Time</b></p>";
    if (similarScheduleList.length > 0) {
        similarScheduleList.forEach((entry) => {
            string = string + "<p><tt>" + entry[1] + "</tt> <tt>" + entry[6] + "</tt> <tt>" + entry[7] + "</tt></p>";
        });
    } else {
        string = string + "<p><tt>--------</tt> <tt>-------</tt> <tt>-------</tt></p>"
    }
    document.getElementById('similarScheduleTable').innerHTML = string;
}
//Resets the similar schedule details panel.
function clearSimilarScheduleForm() {
    document.getElementById("similarScheduleTitle").innerHTML = "Schedule for Cinema X MM-DD-YYYY";
    document.getElementById('similarScheduleTable').innerHTML = "<p><b>Movie Name</b> <b>Start Time</b> <b>End Time</b></p><p><tt>--------</tt> <tt>-------</tt> <tt>-------</tt></p>"
}
//Movie screening schedule conflict validation.
function checkTimeConflict(startTime, endTime, date, cinema, movieIDToExclude) {
    //Get list of movie entries on the same day and cinema.
    moviesSameDayCinema = filterListByCinema(cinema, filterListByDate(date, getSortedList()));
    //The function won't proceed if there are no possible movie screenings that would be in conflict found.
    timeList = []
    if (moviesSameDayCinema.length > 0) {
        //Collect all the start times and end times.
        moviesSameDayCinema.forEach((entry) => {
            //Won't collect the time for the current movie if its record already exists.
            if (!(entry[0] == movieIDToExclude)) {
                timeList.push(entry[6]);
                timeList.push(entry[7]);
            }
        });
        for (let i = 0; i < timeList.length; i++) {
            //Check if each time in the timelist is within the entered duration of the movie. It must be not, else there would be time conflict.
            if (timeList[i] >= startTime && timeList[i] <= endTime) {
                alert("The inputted movie screening time is in conflict with another schedule.")
                //There is conflict (true).
                return true;
            }
        }
    }
    return false;
}
//======================================================



//======================================================
//ADMIN VIEW AND DELETE FUNCTIONS
//------------------------------------------------------
//Temporary list to do deletions in.
var deletionList = [];
//LOAD FUNCTION for the View or Delete Movie Data form
function loadDeleteMovie_Prompt() {
    //Clears the deletion list and loads the movie entries from the main list (sorted).
    deletionList = [];
    getSortedList().forEach((value) => {
        deletionList.push(value);
    });
    //Hides the not found error initially.
    document.getElementById('deleteByIDWarning').hidden = true;
    renderDeleteMovieTable();
}
//SUBMIT EVENT for View or Delete Movie Data form
function deleteMovie_PromptFunc(event) {
    event.preventDefault();
    resetForm('deleteMovie_Prompt');
    //Clears the main list.
    mainList.length = 0;
    //Transfers the contents of the deletion list into the main list; save the changes.
    deletionList.forEach((entry) => {
        mainList.push(entry);
    });
    moveToForm('deleteMovie_Prompt', 'adminInitMenu');
}
//Delete button function for text input.
function deleteByInputIDBtn() {
    //Collects entries with matching name to the inputted name into a separate list.
    let value = document.getElementById('deleteByIDInput').value;
    let matchingEntry = "";
    deletionList.forEach((entry) => {
        if (entry[0] == value) {
            matchingEntry = entry;
        }
    })
    //Deletes the movie entry if the user inputted a valid ID.
    if (matchingEntry == "") {
        document.getElementById('deleteByIDWarning').innerHTML = "No matching entry found.";
        document.getElementById('deleteByIDWarning').hidden = false;
    } else {
        document.getElementById('deleteByIDWarning').hidden = true;
        deleteByIDBtn('deleteByIDInput');
        alert("Movie with ID: " + value + " deleted.");
    }
}
//View button function for text input.
function expandByInputIDBtn() {
    //Collects entries with matching name to the inputted name into a separate list.
    let value = document.getElementById('deleteByIDInput').value;
    let matchingEntry = "";
    getSortedList().forEach((entry) => {
        if (entry[0] == value) {
            matchingEntry = entry;
        }
    })
    //Shows the complete details about the movie if the user inputted a valid ID.
    if (matchingEntry == "") {
        document.getElementById('deleteByIDWarning').innerHTML = "No matching entry found.";
        document.getElementById('deleteByIDWarning').hidden = false;
    } else {
        document.getElementById('deleteByIDWarning').hidden = true;
        expandBtnFunc(value);
    }
}
//Delete by ID button, takes an element ID to retrieve movieID from.
function deleteByIDBtn(elementId) {
    let movieID = document.getElementById(elementId).value;
    deletionList.forEach((entry, index) => {
        if (movieID == entry[0]) {
            //removes the entry in the deletion list.
            deletionList.splice(index, 1);
        }
    })
    //Updates the selection and table to reflect changes
    renderDeleteMovieTable();
}
//A list to keep track of what movies are shown in the table, especially important when filters are applied.
let deleteTableListedMovies = [];
//Updates the movie entries shown in the table.
function renderFilteredDeleteTable() {
    //Clears the list of listed movies to append inputted values.
    deleteTableListedMovies.length = 0;
    let cinema = document.getElementById('deleteFilterCinema').value;
    let date = document.getElementById('deleteFilterDate').value;
    let name = document.getElementById('deleteFilterName').value;
    //Filtering algorithm
    let match1List = [];
    deletionList.forEach((entry) => {
        //Cinema filtering
        if (cinema == "Any") {
            match1List.push(entry);
        } else if (entry[4] == cinema) {
            match1List.push(entry);
        }
    });
    let match2List = [];
    match1List.forEach((entry) => {
        //Date filtering
        if (date == "") {
            match2List.push(entry);
        } else if (entry[5] == date) {
            match2List.push(entry);
        }
    });
    let match3List = [];
    match2List.forEach((entry) => {
        //Name filtering
        if (name == "") {
            match3List.push(entry);
        } else if (entry[1] == name) {
            match3List.push(entry);
        }
    });

    //Set the table header row.
    let string = "<p><b>Movie ID</b> <b>Movie Title</b> <b>Genre</b> <b>Restriction</b> <b>Venue</b> <b>Date</b> <b>StartTime</b> <b>End Time</b> <b>Price</b> <b></b> <b></b></p>";
    //HTML code for each movie table row. Appends the listed titles
    match3List.forEach((entry) => {
        deleteTableListedMovies.push(entry);
        string = string + "<p><tt>" + entry[0] + "</tt><tt>" + entry[1] + "</tt><tt>" + entry[2] + "</tt><tt>" + entry[3] + "</tt><tt>" + entry[4] + "</tt><tt>" + entry[5] + "</tt><tt>" + entry[6] + "</tt><tt>" + entry[7] + "</tt><tt>" + entry[8] + "</tt><tt><button type='button' onclick='expandBtnFunc(" + entry[0] + ")'>View</button></tt><button type='button' onclick='deleteBtnFunc(" + entry[0] + ")'>Delete</button></p>"
    });
    document.getElementById('deleteMovieTable').innerHTML = string;
}
//Button function for clearing filters.
function deleteClearFilterBtnFunc() {
    document.getElementById('deleteFilterCinema').value = "Any";
    document.getElementById('deleteFilterDate').value = "";
    document.getElementById('deleteFilterName').value = "";
    renderDeleteMovieTable();
}
//Shows all movies, without filter, in the table.
function renderDeleteMovieTable() {
    //Clears the list of listed movies to append inputted values.
    deleteTableListedMovies.length = 0;
    //Set the table header row.
    let string = "<p><b>Movie ID</b> <b>Movie Title</b> <b>Genre</b> <b>Restriction</b> <b>Venue</b> <b>Date</b> <b>StartTime</b> <b>End Time</b> <b>Price</b> <b></b> <b></b></p>";
    //HTML code for each movie table row. Appends the listed titles
    deletionList.forEach((entry) => {
        deleteTableListedMovies.push(entry)
        string = string + "<p><tt>" + entry[0] + "</tt><tt>" + entry[1] + "</tt><tt>" + entry[2] + "</tt><tt>" + entry[3] + "</tt><tt>" + entry[4] + "</tt><tt>" + entry[5] + "</tt><tt>" + entry[6] + "</tt><tt>" + entry[7] + "</tt><tt>" + entry[8] + "</tt><tt><button type='button' onclick='expandBtnFunc(" + entry[0] + ")'>View</button></tt><button type='button' onclick='deleteBtnFunc(" + entry[0] + ")'>Delete</button></p>"
    });
    document.getElementById('deleteMovieTable').innerHTML = string;
}
//A function to proceed to the form showing the complete details of a movie.
function expandBtnFunc(movieID) {
    loadViewMovie_AllDetails(mainList[getIndexFromMovieID(movieID)]);
    moveToForm('deleteMovie_Prompt', 'viewMovie_AllDetails');
}
//LOAD FUNCTION for view all details form.
function loadViewMovie_AllDetails(movieEntry) {
    document.getElementById('viewAllMovieID').innerHTML = movieEntry[0];
    document.getElementById('viewAllMovieName').innerHTML = movieEntry[1];
    document.getElementById('viewAllMovieGenre').innerHTML = movieEntry[2];
    document.getElementById('viewAllMovieRestriction').innerHTML = movieEntry[3];
    document.getElementById('viewAllMovieVenue').innerHTML = movieEntry[4];
    document.getElementById('viewAllMovieDate').innerHTML = movieEntry[5];
    document.getElementById('viewAllMovieStartTime').innerHTML = movieEntry[6];
    document.getElementById('viewAllMovieEndTime').innerHTML = movieEntry[7];
    document.getElementById('viewAllMoviePrice').innerHTML = "PHP " + parseFloat(movieEntry[8]).toFixed(2);
    document.getElementById('viewAllMovieEarnings').innerHTML = "PHP " + parseFloat(movieEntry[14]).toFixed(2);
    // Sets up the table so that it only shows the appropriate seats depending on the cinema; cinema 1 is 4x5, cinema 2 is 4x4, and cinema 3 is 4x3.
    let rowIDList = ['viewSeatTableRow1', 'viewSeatTableRow2', 'viewSeatTableRow3', 'viewSeatTableRow4', 'viewSeatTableRow5'];
    let rowBookingList = [movieEntry[9], movieEntry[10], movieEntry[11], movieEntry[12], movieEntry[13]];
    rowIDList.forEach((rowID) => {
        document.getElementById(rowID).style.display = "table-row";
    });
    if (movieEntry[4] == "Cinema 2") {
        document.getElementById(rowIDList[4]).style.display = "none";
        rowBookingList = rowBookingList.slice(0, -1);
    } else if (movieEntry[4] == "Cinema 3") {
        document.getElementById(rowIDList[4]).style.display = "none";
        document.getElementById(rowIDList[3]).style.display = "none";
        rowBookingList = rowBookingList.slice(0, -2);
    }

    // Loads the booking record into the table.
    rowBookingList.forEach((rowBooking, index) => {
        Array.from(document.getElementById(rowIDList[index]).children).forEach((seat, seatIndex) => {
            if (rowBooking[seatIndex] == 1) {
                seat.children[0].checked = true;
            } else {
                seat.children[0].checked = false;
            }
        })
    });
}
//Separated function for dynamic delete button onclick event to avoid conflict with single (') and double (") use. (Used in renderDeleteMovieTable)
function deleteBtnFunc(movieID) {
    deletionList.forEach((entry, index) => {
        if (movieID == entry[0]) {
            //removes the entry in the deletion list.
            deletionList.splice(index, 1);
            renderDeleteMovieTable();
        }
    })
    //Updates the selection and table to reflect changes.
    renderDeleteMovieTable();
}
//Deletes all the movies shown in the table.
function deleteAllListedBtn() {
    //Deletes the listed movies from the deletion list.
    deleteTableListedMovies.forEach((toDelete) => {
        deletionList.splice(deletionList.indexOf(toDelete), 1);
    })
    renderDeleteMovieTable();
}
//SUBMIT EVENT for the view all details form
function viewMovie_AllDetailsFunc(event) {
    event.preventDefault();
    moveToForm('viewMovie_AllDetails', 'deleteMovie_Prompt');
}
//======================================================



//======================================================
//CASHIER FUNCTIONS
//------------------------------------------------------
//LOAD FUNCTION for cashier view form.
function loadCashierView() {
    //Initially hides the warning for Book by Movie ID and Filter by Name.
    document.getElementById('bookByIDWarning').hidden = true;
    document.getElementById('viewByNameWarning').hidden = true;
    renderTableBookingMenu(getSortedList())
}
//SUBMIT EVENT Cashier Menu
function cashierViewAllMoviesFunc(event) {
    event.preventDefault();
    //Verifies if movieID is in mainList.
    let entryIndex = null;
    let userInputID = document.getElementById('cashierViewAllMovies_IDInput').value;
    for (let i = 0; i < mainList.length; i++) {
        if (mainList[i][0] == userInputID) {
            entryIndex = i;
            break;
        }
    }
    //Calls the booking function for the specified movie ID.
    if (entryIndex != null) {
        bookBtnFunc(userInputID)
    } else {
        document.getElementById('bookByIDWarning').innerHTML = "No entry with ID: " + userInputID + " found."
        document.getElementById('bookByIDWarning').hidden = false;
    }

}
//Renders a list of movie entries into the booking form table for the cashier to chose from.
function renderTableBookingMenu(movieList) {
    //Set the table header row.
    document.getElementById('cashierViewAllTable').innerHTML =
        "<p><b>Movie ID</b> <b>Movie Title</b> <b>Genre</b> <b>Restriction</b> <b>Venue</b> <b>Date</b> <b>Start Time</b> <b>End Time</b> <b>Price</b> <b></b></p>"
    for (let i = 0; i < movieList.length; i++) {
        let entry = movieList[i];
        //Add each movie entry from list into the table.
        document.getElementById('cashierViewAllTable').innerHTML = document.getElementById('cashierViewAllTable').innerHTML +
            ("<p><tt>" + entry[0] + "</tt> <tt>" + entry[1] + "</tt> <tt>" + entry[2] + "</tt> <tt>" + entry[3]
                + "</tt> <tt>" + entry[4] + "</tt> <tt>" + entry[5] + "</tt> <tt>" + entry[6] + "</tt> <tt>" + entry[7]
                + "</tt><tt>" + entry[8] + "</tt><button onclick='bookBtnFunc(" + entry[0] + ")'>Book</button></p>")
    }
}
//Separated function for dynamic button onclick event to avoid conflict with single (') and double (") use. (Used in renderTableBookingMenu)
function bookBtnFunc(movieID) {
    loadBookMovie(movieID)
    moveToForm('cashierViewAllMovies', 'cashierBookMovie')
}
//Filter by name function.
function viewByNameBtnFunc() {
    //Collects entries with matching name to the inputted name into a separate list.
    let movieName = document.getElementById('cashierViewByNameInput').value;
    matchingEntries = [];
    getSortedList().forEach((entry) => {
        if (entry[1] == movieName) {
            matchingEntries.push(entry);
        }
    })
    //Renders the matching entries into the table if there is any. Else indicates that there was no matching entry found.
    if (matchingEntries.length > 0) {
        renderTableBookingMenu(matchingEntries);
        document.getElementById('viewByNameWarning').hidden = true;
    } else {
        document.getElementById('viewByNameWarning').hidden = false;
    }
}
//LOAD FUNCTION for the booking form.
function loadBookMovie(movieID) {
    //Initializes the selected seat list.
    selectedSeatList = [];
    //Clears the details for book movie, to avoid left over changes from previous transaction.
    document.getElementById('selectedSeatCount').innerHTML = "0";
    document.getElementById('totalCostBooking').innerHTML = "PHP 0.00"
    document.getElementById('discountBooking').innerHTML = "PHP 0.00"
    document.getElementById('amountToPay').innerHTML = "PHP 0.00"
    document.getElementById('bookConfirm').disabled = true;
    //Loads the details of the movie into the booking form.
    let index = getIndexFromMovieID(movieID);
    let entry = mainList[index];
    document.getElementById('bookPreviewMovieID').innerHTML = entry[0];
    document.getElementById('bookPreviewMovieTitle').innerHTML = entry[1];
    document.getElementById('bookPreviewMovieGenre').innerHTML = entry[2];
    document.getElementById('bookPreviewMovieRestriction').innerHTML = entry[3];
    document.getElementById('bookPreviewMovieVenue').innerHTML = entry[4];
    document.getElementById('bookPreviewMovieDate').innerHTML = entry[5];
    document.getElementById('bookPreviewMovieStartTime').innerHTML = entry[6];
    document.getElementById('bookPreviewMovieEndTime').innerHTML = entry[7];
    document.getElementById('bookPreviewMoviePrice').innerHTML = entry[8];
    loadSeatBookingTable('bookMovieTableRow1', 'bookMovieTableRow2', 'bookMovieTableRow3', 'bookMovieTableRow4', 'bookMovieTableRow5', entry, false);
}
//This sets up the seats checkbox table shown in the booking form.
function loadSeatBookingTable(row1ID, row2ID, row3ID, row4ID, row5ID, movieEntry, disabledBool) {
    // Sets up the table so that it only shows the appropriate seats depending on the cinema; cinema 1 is 4x5, cinema 2 is 4x4, and cinema 3 is 4x3.
    let rowIDList = [row1ID, row2ID, row3ID, row4ID, row5ID];
    let rowBookingList = [movieEntry[9], movieEntry[10], movieEntry[11], movieEntry[12], movieEntry[13]];
    rowIDList.forEach((rowID) => {
        document.getElementById(rowID).style.display = "table-row";
    });
    if (movieEntry[4] == "Cinema 2") {
        document.getElementById(row5ID).style.display = "none";
        rowBookingList = rowBookingList.slice(0, -1);
    } else if (movieEntry[4] == "Cinema 3") {
        document.getElementById(row5ID).style.display = "none";
        document.getElementById(row4ID).style.display = "none";
        rowBookingList = rowBookingList.slice(0, -2);
    }

    // Initial setup of checkboxes by clearing all the disabled property.
    rowIDList.forEach((rowID) => {
        Array.from(document.getElementById(rowID).children).forEach((seat) => {
            seat.children[0].disabled = false;
        })
    })
    // Loads the booking record into the table.
    rowBookingList.forEach((rowBooking, index) => {
        Array.from(document.getElementById(rowIDList[index]).children).forEach((seat, seatIndex) => {
            if (rowBooking[seatIndex] == 1) {
                seat.children[0].checked = true;
                seat.children[0].disabled = true;
            } else {
                seat.children[0].checked = false;
            }
        })
    });
    // Disables the checkboxes so it cannot be modified; or vice versa.
    if (disabledBool) {
        rowIDList.forEach((rowID) => {
            Array.from(document.getElementById(rowID).children).forEach((seat) => {
                seat.children[0].disabled = true;
            })
        })
    }
}
//SUBMIT EVENT for cashier book menu.
function cashierBookMovieFunc(event) {
    event.preventDefault();
    loadReceipt();
    moveToForm('cashierBookMovie', 'receipt');
}
//An array to keep track of selected seats in the booking form.
let selectedSeatList = [];
//This function is called every time a checkbox is clicked, so as to update the shown details in the booking form.
function updateSeatSelected(checkBox) {
    if (checkBox.checked) {
        //Adds the seat to the list.
        selectedSeatList.push(checkBox.value);
    } else {
        //Removes the seat from the list.
        selectedSeatList.splice(selectedSeatList.indexOf(checkBox.value), 1);
    }
    //Updates the number of selected seat in the form.
    document.getElementById('selectedSeatCount').innerHTML = selectedSeatList.length;
    //Updates the total cost text in the form.
    document.getElementById('totalCostBooking').innerHTML = "PHP " + (parseInt(document.getElementById('bookPreviewMoviePrice').innerHTML) * selectedSeatList.length).toFixed(2);
    // Disables the submit button for the form if there is no selected seat.
    if (selectedSeatList.length > 0) {
        document.getElementById("bookConfirm").disabled = false;
    } else {
        document.getElementById("bookConfirm").disabled = true;
    }
    updateVoucherDiscount(document.getElementById("voucher"));
    updateAmountToPay();
    validatePayment();
}
//Updates the discount value shown in the book movie form.
function updateVoucherDiscount(voucherInput) {
    let total = parseInt(document.getElementById("bookPreviewMoviePrice").innerHTML) * selectedSeatList.length;
    if (voucherInput.value in voucherCodes) {
        document.getElementById("discountBooking").innerHTML = "PHP " + String((voucherCodes[voucherInput.value] * total).toFixed(2) * -1);
    } else {
        document.getElementById("discountBooking").innerHTML = "PHP 0";
    }
    updateAmountToPay()
}
//Updates the displayed Amount to Pay
function updateAmountToPay() {
    let total = parseInt(document.getElementById("bookPreviewMoviePrice").innerHTML) * selectedSeatList.length;
    let discount = document.getElementById('discountBooking').innerHTML.split(" ")[1] * -1;
    let amount = total - discount;
    document.getElementById('amountToPay').innerHTML = "PHP " + amount.toFixed(2);
}
//Validation function for payment. Disables the confirm button if the inputted payment is not enough.
function validatePayment() {
    let amount = document.getElementById('amountToPay').innerHTML.split(" ")[1];
    let payment = parseFloat(document.getElementById('bookingPayment').value);
    if (payment >= amount && amount != 0) {
        document.getElementById('bookConfirm').disabled = false;
    } else {
        document.getElementById('bookConfirm').disabled = true;

    }
}
//LOAD FUNCTION for receipt form.
function loadReceipt() {
    //Computation for receipt details.
    let payment = document.getElementById("bookingPayment").value;
    let total = parseInt(document.getElementById("bookPreviewMoviePrice").innerHTML) * selectedSeatList.length;
    let discount;
    let voucher = document.getElementById("voucher").value;
    //Computes for the discount if a valid voucher code is provided.
    if (voucher in voucherCodes) {
        //Rounds to two decimals
        discount = (voucherCodes[voucher] * total).toFixed(2);
    } else {
        discount = 0;
    }
    let amount = total - discount;
    let change = payment - amount;
    //Adds the amount to the movie's total earnings.
    let movieIndex = getIndexFromMovieID(document.getElementById('bookPreviewMovieID').innerHTML)
    mainList[movieIndex][14] =  parseInt(mainList[movieIndex][14]) + amount;

    let items = "";
    for (let i = 0; i < selectedSeatList.length; i++) {
        items = items + "            <p><tt class='widthA padLeft'>Seat " + selectedSeatList.sort()[i] + " | " + mainList[movieIndex][0] + " "
            + mainList[movieIndex][1] + " " + mainList[movieIndex][5] + " " + mainList[movieIndex][6] + "-" + mainList[movieIndex][7]
            + "</tt><tt class='alignRight'>" + mainList[movieIndex][8] + "</tt></p>";
    }
    document.getElementById('receiptItems').innerHTML = items;

    //Set transaction details to receipt.
    let date = new Date();
    document.getElementById("transactionTime").innerHTML = "Transaction time: " + date.toLocaleString();
    document.getElementById("receiptTotal").innerHTML = total.toFixed(2);
    document.getElementById("receiptDiscount").innerHTML = parseFloat(discount).toFixed(2) * -1;
    document.getElementById("receiptAmount").innerHTML = amount.toFixed(2);
    document.getElementById("receiptPayment").innerHTML = parseFloat(payment).toFixed(2);
    document.getElementById("receiptChange").innerHTML = change.toFixed(2);

    //Marks the selected seats as sold in the movie's record.
    selectedSeatList.forEach((seatCode) => {
        //The seat code is deconstructed to get its corresponding node location in the mainList.
        row = seatCode[1];
        switch (row) {
            case '1':
                row = 9; //row1
                break;
            case '2':
                row = 10; //row2
                break;
            case '3':
                row = 11; //row3
                break;
            case '4':
                row = 12; //row4
                break;
            case '5':
                row = 13; //row5
                break;
        }
        column = seatCode[0];
        switch (column) {
            case 'A':
                column = 0; //index 0
                break;
            case 'B':
                column = 1; //index 1
                break;
            case 'C':
                column = 2; // index 2
                break;
            case 'D':
                column = 3; // index 3
                break;
        }
        //0 value means seat is vacant, changes it to 1 to mark as no longer vacant.
        mainList[movieIndex][row][column] = 1;
    });

}
//SUBMIT EVENT for receipt form.
function receiptFunc(event) {
    event.preventDefault();
    loadCashierView();
    moveToForm("receipt", "cashierViewAllMovies")
    resetForm("receipt");
    resetForm("cashierBookMovie");
}
//======================================================


// LOAD FUNCTIONS - these prepare a form before displaying them.
// SUBMIT EVENT - the function that gets called when the submit event is called on a form.