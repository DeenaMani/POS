import { Router } from "express";
import LocationController from "./location.controller";

const locationRoutes = Router();

/**
 * Location Management Module
 * Handles operations such as fetching location data.
 */

/**
 * Fetch all countries.
 * @route GET /locations/countries
 * @returns {object} List of countries.
 */
locationRoutes.get("/countries", LocationController.getCountries);

/**
 * Fetch all states.
 * @route GET /locations/states
 * @returns {object} List of states.
 */
locationRoutes.get("/states/:id", LocationController.getStates);

/**
 * Fetch all cities.
 * @route GET /locations/cities
 * @returns {object} List of cities.
 */
locationRoutes.get("/cities/:id", LocationController.getCities);



export default locationRoutes;