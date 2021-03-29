package io.job4u.springboot.service;

import io.job4u.springboot.model.City;

import java.util.List;

public interface ICityService {

    List<City> findAll();
}